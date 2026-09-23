import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { resolveSafe, isSafeSegment, atomicWrite, withLock } from './fsGuard.js'
import { noteAdminWrite } from './data-reload-plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// deptpage/data holds the JSON files directly; deptpage/articles and
// deptpage/images are symlinks to the repo-root copies GitHub Pages serves.
const DATA_DIR = path.resolve(__dirname, '../data')
const ARTICLES_DIR = path.resolve(__dirname, '../articles')
const IMAGES_DIR = path.resolve(__dirname, '../images')
const DEPTPAGE_DIR = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DEPTPAGE_DIR, '..')

const DATA_FILES = new Set([
  'frontpage.json',
  'news.json',
  'colloquium.json',
  'people.json',
  'courses.json',
  'students.json',
  'research.json',
  'major.json',
  'nonmajors.json',
  'about.json',
])

const IMAGE_SUBFOLDERS = new Set([
  'misc',
  'people',
  'colloquium',
  'students',
  'courseicons',
  'wics',
])

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'])

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

const readBody = (req, maxBytes = 5 * 1024 * 1024) => new Promise((resolve, reject) => {
  const chunks = []
  let total = 0
  req.on('data', (chunk) => {
    total += chunk.length
    if (total > maxBytes) {
      reject(Object.assign(new Error('request body too large'), { statusCode: 413 }))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

const sendJson = (res, statusCode, body) => {
  const text = JSON.stringify(body)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(text)
}

const sendError = (res, statusCode, message) => sendJson(res, statusCode, { error: message })

const hashOf = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

const handleGetData = async (req, res, filename) => {
  if (!DATA_FILES.has(filename)) return sendError(res, 404, `unknown data file: ${filename}`)
  const filePath = path.join(DATA_DIR, filename)
  const raw = await fs.readFile(filePath, 'utf8')
  res.setHeader('ETag', hashOf(Buffer.from(raw)))
  sendJson(res, 200, JSON.parse(raw))
}

const handlePutData = async (req, res, filename) => {
  if (!DATA_FILES.has(filename)) return sendError(res, 404, `unknown data file: ${filename}`)
  const filePath = path.join(DATA_DIR, filename)

  const ifMatch = req.headers['if-match']
  const body = await readBody(req)
  let data
  try {
    data = JSON.parse(body.toString('utf8'))
  } catch {
    return sendError(res, 400, 'request body is not valid JSON')
  }
  const serialized = `${JSON.stringify(data, null, 4)}\n`

  // The If-Match check and the write it gates must happen as one step --
  // otherwise two admins who both loaded the same version can each pass the
  // check before either has written, and the second write silently clobbers
  // the first instead of getting the 409 the check exists to produce.
  await withLock(`data:${filename}`, async () => {
    if (ifMatch) {
      let current
      try {
        current = await fs.readFile(filePath, 'utf8')
      } catch {
        current = null
      }
      if (current !== null && hashOf(Buffer.from(current)) !== ifMatch) {
        throw Object.assign(new Error('file changed on disk since it was loaded; reload and retry'), { statusCode: 409 })
      }
    }
    noteAdminWrite(filePath, serialized)
    await atomicWrite(filePath, serialized)
  })

  res.setHeader('ETag', hashOf(Buffer.from(serialized)))
  sendJson(res, 200, { ok: true })
}

const handleGetArticle = async (req, res, articlePath) => {
  let resolved
  try {
    resolved = await resolveSafe(ARTICLES_DIR, articlePath)
  } catch (err) {
    return sendError(res, 400, err.message)
  }
  if (!resolved.endsWith('.md')) return sendError(res, 400, 'article path must end in .md')
  try {
    const content = await fs.readFile(resolved, 'utf8')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('ETag', hashOf(Buffer.from(content)))
    res.statusCode = 200
    res.end(content)
  } catch (err) {
    if (err.code === 'ENOENT') return sendError(res, 404, 'article not found')
    throw err
  }
}

const handlePutArticle = async (req, res, articlePath) => {
  if (!articlePath.endsWith('.md')) return sendError(res, 400, 'article path must end in .md')
  const segments = articlePath.split('/')
  if (!segments.every(isSafeSegment)) return sendError(res, 400, `unsafe article path: ${articlePath}`)
  const resolved = path.resolve(await fs.realpath(ARTICLES_DIR), ...segments)

  const ifMatch = req.headers['if-match']
  const body = await readBody(req, 2 * 1024 * 1024)

  await withLock(`article:${articlePath}`, async () => {
    if (ifMatch) {
      let current
      try {
        current = await fs.readFile(resolved, 'utf8')
      } catch {
        current = null
      }
      if (current !== null && hashOf(Buffer.from(current)) !== ifMatch) {
        throw Object.assign(new Error('article changed on disk since it was loaded; reload and retry'), { statusCode: 409 })
      }
    }
    noteAdminWrite(resolved, body)
    await atomicWrite(resolved, body)
  })

  res.setHeader('ETag', hashOf(body))
  sendJson(res, 200, { ok: true, path: `articles/${segments.join('/')}` })
}

// Any admin can upload arbitrary photos straight off a phone, so this
// applies the same treatment repo images got compressed to by hand
// (see the "Compress the site's images" commit): capped at 2000px on
// the long edge -- comfortably more than the 1050px max content width
// needs even at retina density -- and re-encoded, which also strips
// embedded EXIF/GPS metadata. Vector and animated formats have no safe
// raster re-encode (SVG has no pixels to resize; re-encoding an
// animated GIF would collapse it to one frame), so those pass through
// untouched.
const MAX_IMAGE_EDGE = 2000
const JPEG_QUALITY = 82

const compressImage = async (buffer, ext) => {
  if (ext === '.svg') return { buffer, ext }

  const probe = sharp(buffer, { animated: true })
  const meta = await probe.metadata()
  if (ext === '.gif' && meta.pages > 1) return { buffer, ext }

  const pipeline = sharp(buffer).rotate().resize({
    width: MAX_IMAGE_EDGE,
    height: MAX_IMAGE_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  })

  // A transparent PNG (a logo, an icon) needs to stay a PNG; a photo
  // exported with an unused alpha channel (common from phone camera
  // apps) doesn't, and compresses far better as JPEG.
  const needsAlpha = meta.hasAlpha && (await pipeline.clone().stats()).channels.at(-1).min < 255
  if (needsAlpha) {
    return { buffer: await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer(), ext: '.png' }
  }
  return { buffer: await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer(), ext: '.jpg' }
}

const uniqueImagePath = async (dir, baseName, ext) => {
  let candidate = `${baseName}${ext}`
  let n = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fs.access(path.join(dir, candidate))
      candidate = `${baseName}-${n}${ext}`
      n += 1
    } catch {
      return candidate
    }
  }
}

const handleUploadImage = async (req, res, subfolder, filename) => {
  if (!IMAGE_SUBFOLDERS.has(subfolder)) return sendError(res, 404, `unknown image subfolder: ${subfolder}`)
  if (!filename) return sendError(res, 400, 'missing filename query parameter')
  const ext = path.extname(filename).toLowerCase()
  if (!IMAGE_EXTENSIONS.has(ext)) return sendError(res, 400, `unsupported image extension: ${ext}`)
  const baseName = path.basename(filename, path.extname(filename)).replace(/[^A-Za-z0-9._-]/g, '-')
  if (!isSafeSegment(`${baseName}${ext}`)) return sendError(res, 400, 'filename could not be sanitized')

  const dir = path.join(await fs.realpath(IMAGES_DIR), subfolder)
  const body = await readBody(req, MAX_UPLOAD_BYTES)
  const { buffer, ext: outExt } = await compressImage(body, ext)

  // Picking the free name and writing it must happen as one step -- two
  // concurrent uploads with the same base name would otherwise both see the
  // name as free and both write it, so the second silently overwrites the
  // first instead of becoming "-2".
  const finalName = await withLock(`image:${subfolder}:${baseName}`, async () => {
    const name = await uniqueImagePath(dir, baseName, outExt)
    await atomicWrite(path.join(dir, name), buffer)
    return name
  })
  sendJson(res, 200, { path: `/images/${subfolder}/${finalName}` })
}

const handleListImages = async (req, res, subfolder) => {
  if (!IMAGE_SUBFOLDERS.has(subfolder)) return sendError(res, 404, `unknown image subfolder: ${subfolder}`)
  const dir = path.join(await fs.realpath(IMAGES_DIR), subfolder)
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => `/images/${subfolder}/${entry.name}`)
    .sort()
  sendJson(res, 200, { files })
}

// Publishing: most content (everything under data/*.json) is statically
// imported into the JS bundle at build time, so writing the files alone
// doesn't change what visitors see. Publish stages+commits the content
// changes locally, then reruns the same build the deploy script uses, so a
// bad edit can't leave the live site half-updated: if the build fails,
// nothing after the commit step touches the served files. It then pushes
// the commit to GitHub as an off-machine backup -- best-effort, since the
// live site has already been updated by the build step by that point, and a
// flaky network or expired credential shouldn't block an editor from
// publishing.
let publishInProgress = false

const runCommand = (cmd, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { cwd })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })
  child.on('error', reject)
  child.on('close', (code) => {
    if (code === 0) resolve(output)
    else reject(Object.assign(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`), { output }))
  })
})

const hasStagedChanges = async () => {
  try {
    await runCommand('git', ['diff', '--cached', '--quiet'], REPO_ROOT)
    return false
  } catch {
    return true
  }
}

const handlePublish = async (req, res) => {
  if (publishInProgress) return sendError(res, 409, 'a publish is already in progress')
  publishInProgress = true
  const log = []
  try {
    log.push(await runCommand('git', ['add', 'deptpage/data', 'articles', 'images'], REPO_ROOT))
    if (await hasStagedChanges()) {
      log.push(await runCommand('git', ['commit', '-m', `Admin panel edit ${new Date().toISOString()}`], REPO_ROOT))
    } else {
      log.push('(no content changes to commit)')
    }
    log.push(await runCommand('npm', ['run', 'deploy'], DEPTPAGE_DIR))

    try {
      log.push(await runCommand('git', ['push', 'origin', 'HEAD'], REPO_ROOT))
    } catch (err) {
      log.push(`warning: git push to GitHub failed (changes are committed locally but not backed up yet):\n${err.output || err.message}`)
    }

    sendJson(res, 200, { ok: true, log: log.join('\n---\n') })
  } catch (err) {
    log.push(err.output || err.message)
    sendJson(res, 500, { ok: false, log: log.join('\n---\n'), error: err.message })
  } finally {
    publishInProgress = false
  }
}

export default function adminApiPlugin() {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use('/__admin-api', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const segments = url.pathname.split('/').filter(Boolean)

          if (segments[0] === 'data' && segments.length === 2) {
            if (req.method === 'GET') return await handleGetData(req, res, segments[1])
            if (req.method === 'PUT') return await handlePutData(req, res, segments[1])
          }

          if (segments[0] === 'article' && segments.length === 1) {
            const articlePath = url.searchParams.get('path') || ''
            const normalized = articlePath.startsWith('articles/') ? articlePath.slice('articles/'.length) : articlePath
            if (req.method === 'GET') return await handleGetArticle(req, res, normalized)
            if (req.method === 'PUT') return await handlePutArticle(req, res, normalized)
          }

          if (segments[0] === 'images' && segments.length === 2) {
            if (req.method === 'POST') return await handleUploadImage(req, res, segments[1], url.searchParams.get('filename'))
            if (req.method === 'GET') return await handleListImages(req, res, segments[1])
          }

          if (segments[0] === 'publish' && segments.length === 1) {
            if (req.method === 'POST') return await handlePublish(req, res)
          }

          return sendError(res, 404, 'no such admin API route')
        } catch (err) {
          const statusCode = err.statusCode || 500
          console.error('[admin-api]', err)
          return sendError(res, statusCode, err.message || 'internal error')
        }
      })
    },
  }
}
