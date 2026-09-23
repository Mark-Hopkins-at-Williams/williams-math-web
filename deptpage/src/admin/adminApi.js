const BASE = '/__admin-api'

const etags = new Map()
const articleEtags = new Map()

const parseErrorBody = async (res) => {
  try {
    const body = await res.json()
    return body.error || res.statusText
  } catch {
    return res.statusText
  }
}

// Session cookies expire (or the server restarted); either way, the admin
// API middleware returns 401 rather than any real data, so send the user
// back to the login page instead of surfacing it as a generic error.
const apiFetch = async (url, options) => {
  const res = await fetch(url, options)
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('not authenticated')
  }
  return res
}

export const getData = async (file) => {
  const res = await apiFetch(`${BASE}/data/${file}`)
  if (!res.ok) throw new Error(await parseErrorBody(res))
  etags.set(file, res.headers.get('ETag'))
  return res.json()
}

export const saveData = async (file, data) => {
  const headers = { 'Content-Type': 'application/json' }
  const etag = etags.get(file)
  if (etag) headers['If-Match'] = etag
  const res = await apiFetch(`${BASE}/data/${file}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseErrorBody(res))
  etags.set(file, res.headers.get('ETag'))
}

// path is the value stored in JSON, e.g. "articles/welcome.md"
export const getArticle = async (path) => {
  if (!path) return ''
  const res = await apiFetch(`${BASE}/article?path=${encodeURIComponent(path)}`)
  if (res.status === 404) return ''
  if (!res.ok) throw new Error(await parseErrorBody(res))
  articleEtags.set(path, res.headers.get('ETag'))
  return res.text()
}

export const saveArticle = async (path, content) => {
  const headers = {}
  const etag = articleEtags.get(path)
  if (etag) headers['If-Match'] = etag
  const res = await apiFetch(`${BASE}/article?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers,
    body: content,
  })
  if (!res.ok) throw new Error(await parseErrorBody(res))
  const body = await res.json()
  articleEtags.set(path, res.headers.get('ETag'))
  return body
}

export const uploadImage = async (subfolder, file) => {
  const res = await apiFetch(`${BASE}/images/${subfolder}?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    body: file,
  })
  if (!res.ok) throw new Error(await parseErrorBody(res))
  const { path } = await res.json()
  return path
}

export const listImages = async (subfolder) => {
  const res = await apiFetch(`${BASE}/images/${subfolder}`)
  if (!res.ok) throw new Error(await parseErrorBody(res))
  const { files } = await res.json()
  return files
}

// Rebuilds the site and updates the live files on this server. See
// vite-plugins/admin-api-plugin.js for what this actually runs.
export const publish = async () => {
  const res = await apiFetch(`${BASE}/publish`, { method: 'POST' })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(body.error || res.statusText), { log: body.log })
  return body
}

export const logout = async () => {
  await fetch('/logout', { method: 'POST' })
  window.location.href = '/login'
}
