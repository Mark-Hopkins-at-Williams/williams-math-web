import { promises as fs } from 'fs'
import path from 'path'

// Filenames coming from the admin UI (article slugs, uploaded image names)
// must not contain path separators or traversal sequences.
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/

export const isSafeSegment = (segment) => (
  typeof segment === 'string' &&
  segment.length > 0 &&
  segment !== '.' &&
  segment !== '..' &&
  SAFE_SEGMENT.test(segment)
)

// Resolves `candidate` (a filename, or a slash-separated relative path made
// of individually-safe segments) against `baseDir` and throws unless the
// result is still inside `baseDir`. `baseDir` should already be a realpath
// (articles/ and images/ are symlinks into the repo root) so the boundary
// check isn't fooled by the symlink layer.
export const resolveSafe = async (baseDir, candidate) => {
  if (typeof candidate !== 'string' || candidate.length === 0) {
    throw new Error('missing path')
  }
  const segments = candidate.split('/')
  if (!segments.every(isSafeSegment)) {
    throw new Error(`unsafe path: ${candidate}`)
  }
  const realBaseDir = await fs.realpath(baseDir)
  const resolved = path.resolve(realBaseDir, ...segments)
  if (resolved !== realBaseDir && !resolved.startsWith(realBaseDir + path.sep)) {
    throw new Error(`path escapes base directory: ${candidate}`)
  }
  return resolved
}

// Writes `contents` to `filePath` atomically (temp file + rename) so a
// crash or dev-server restart mid-write can never leave a truncated file.
export const atomicWrite = async (filePath, contents) => {
  const dir = path.dirname(filePath)
  const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp-${process.pid}-${Date.now()}`)
  await fs.writeFile(tempPath, contents)
  await fs.rename(tempPath, filePath)
}

// Per-key async mutex. Two admin requests racing on the same key (e.g. the
// same data file, or the same image base name) run `fn` one at a time
// instead of interleaving around an `await` -- needed anywhere a check
// (does this hash/filename still match?) and the write it gates aren't a
// single synchronous step.
const tails = new Map()

export const withLock = (key, fn) => {
  const tail = tails.get(key) || Promise.resolve()
  const result = tail.then(fn, fn)
  const nextTail = result.then(() => {}, () => {})
  tails.set(key, nextTail)
  nextTail.finally(() => {
    if (tails.get(key) === nextTail) tails.delete(key)
  })
  return result
}
