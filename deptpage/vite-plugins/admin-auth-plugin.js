import fsSync from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CREDENTIALS_PATH = path.resolve(__dirname, '../server/credentials.json')

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 8
const FAILED_ATTEMPT_WINDOW_MS = 10 * 60 * 1000
const MAX_BODY_BYTES = 64 * 1024

// token -> expiresAt. In-memory by design: a restart just means logging back
// in, and it avoids persisting session state anywhere on disk.
const sessions = new Map()
let failedAttempts = []

const parseCookies = (header) => {
  const out = {}
  if (!header) return out
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=')
    if (idx === -1) return
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  })
  return out
}

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  let total = 0
  req.on('data', (chunk) => {
    total += chunk.length
    if (total > MAX_BODY_BYTES) {
      reject(Object.assign(new Error('request body too large'), { statusCode: 413 }))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})

const parseFormOrJson = (contentType, body) => {
  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return Object.fromEntries(new URLSearchParams(body))
}

const createSession = () => {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_TTL_MS)
  return token
}

const isSessionValid = (token) => {
  if (!token) return false
  const expiresAt = sessions.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    sessions.delete(token)
    return false
  }
  sessions.set(token, Date.now() + SESSION_TTL_MS) // sliding expiry
  return true
}

const verifyPassword = (creds, username, password) => {
  if (typeof password !== 'string' || password.length === 0) return false
  if (username !== creds.username) return false
  const salt = Buffer.from(creds.salt, 'hex')
  const expected = Buffer.from(creds.hash, 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length)
  return crypto.timingSafeEqual(actual, expected)
}

const tooManyFailedAttempts = () => {
  const cutoff = Date.now() - FAILED_ATTEMPT_WINDOW_MS
  failedAttempts = failedAttempts.filter((t) => t > cutoff)
  return failedAttempts.length >= MAX_FAILED_ATTEMPTS
}

const recordFailedAttempt = () => {
  failedAttempts.push(Date.now())
}

const loginPage = (error) => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Admin Login</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f7f8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  form { background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.15); width: 280px; }
  h1 { font-size: 18px; margin: 0 0 20px; color: #1a1a1a; }
  label { display: block; font-size: 13px; color: #444; margin-bottom: 4px; }
  input { width: 100%; box-sizing: border-box; padding: 8px 10px; margin-bottom: 14px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
  button { width: 100%; padding: 9px; background: #3a3a63; color: #fff; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; }
  .error { color: #b00020; font-size: 13px; margin-bottom: 14px; }
</style>
</head>
<body>
<form method="POST" action="/login">
  <h1>Math Dept Admin</h1>
  ${error ? '<div class="error">Incorrect username or password.</div>' : ''}
  <label for="username">Username</label>
  <input id="username" name="username" autocomplete="username" autofocus />
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" />
  <button type="submit">Log in</button>
</form>
</body>
</html>`

const sendHtml = (res, statusCode, html) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}

// Reads server/credentials.json once at startup (not present in local
// checkouts, only created on the deployed server via set-password.mjs). When
// absent, this plugin does nothing at all, so `npm run dev` on a laptop is
// unaffected.
export default function adminAuthPlugin() {
  let credentials = null
  try {
    credentials = JSON.parse(fsSync.readFileSync(CREDENTIALS_PATH, 'utf8'))
  } catch {
    credentials = null
  }

  return {
    name: 'admin-auth-plugin',
    configureServer(server) {
      if (!credentials) return

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const { pathname } = url

        if (pathname === '/login') {
          if (req.method === 'GET') {
            sendHtml(res, 200, loginPage(url.searchParams.get('error')))
            return
          }
          if (req.method === 'POST') {
            if (tooManyFailedAttempts()) {
              sendHtml(res, 429, loginPage(true))
              return
            }
            let username, password
            try {
              const body = await readBody(req)
              ;({ username, password } = parseFormOrJson(req.headers['content-type'], body))
            } catch (err) {
              res.statusCode = err.statusCode || 400
              res.end()
              return
            }
            if (verifyPassword(credentials, username, password)) {
              const token = createSession()
              res.setHeader(
                'Set-Cookie',
                `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
              )
              res.statusCode = 302
              res.setHeader('Location', '/admin')
              res.end()
              return
            }
            recordFailedAttempt()
            sendHtml(res, 401, loginPage(true))
            return
          }
        }

        if (pathname === '/logout' && req.method === 'POST') {
          const cookies = parseCookies(req.headers.cookie)
          if (cookies[SESSION_COOKIE]) sessions.delete(cookies[SESSION_COOKIE])
          res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`)
          res.statusCode = 302
          res.setHeader('Location', '/login')
          res.end()
          return
        }

        const guarded = pathname === '/admin' || pathname.startsWith('/admin/')
          || pathname === '/__admin-api' || pathname.startsWith('/__admin-api/')
        if (guarded) {
          const cookies = parseCookies(req.headers.cookie)
          if (!isSessionValid(cookies[SESSION_COOKIE])) {
            if (pathname.startsWith('/__admin-api')) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'not authenticated' }))
              return
            }
            res.statusCode = 302
            res.setHeader('Location', '/login')
            res.end()
            return
          }
        }

        next()
      })
    },
  }
}
