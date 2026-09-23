import { watch, promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../data')
const ARTICLES_DIR = path.resolve(__dirname, '../articles')

// vite.config.js tells Vite's watcher to ignore data/ and articles/ so that
// admin-panel saves don't full-reload the admin tab mid-edit. The catch is
// that edits made any other way (by hand, a script, git pull) also went
// unnoticed until the dev server was restarted. This plugin watches those
// directories itself and reloads open tabs for any change that did NOT come
// from the admin API -- recognized by content: the admin API records a hash
// of every file it writes (via noteAdminWrite), and a change whose new
// content matches that hash is skipped.
const adminWrites = new Map()
const hashOf = (buf) => crypto.createHash('sha1').update(buf).digest('hex')

export const noteAdminWrite = (filePath, contents) => {
  adminWrites.set(filePath, hashOf(Buffer.from(contents)))
}

export default function dataReloadPlugin() {
  return {
    name: 'data-reload-plugin',
    apply: 'serve',
    async configureServer(server) {
      const timers = new Map()

      const onChange = (filePath) => {
        // atomicWrite (temp file + rename) and editors' save strategies fire
        // several events per save; act once things settle.
        clearTimeout(timers.get(filePath))
        timers.set(filePath, setTimeout(async () => {
          timers.delete(filePath)
          let contents
          try {
            contents = await fs.readFile(filePath)
          } catch {
            return // deleted, or a temp file already renamed away
          }
          if (adminWrites.get(filePath) === hashOf(contents)) return

          // data/*.json is bundled into the app via import, so drop Vite's
          // cached transform; articles are fetched at runtime and only need
          // the page reload.
          for (const mod of server.moduleGraph.getModulesByFile(filePath) ?? []) {
            server.moduleGraph.invalidateModule(mod)
          }
          server.config.logger.info(`[data-reload] ${path.relative(path.dirname(DATA_DIR), filePath)} changed, reloading`, { timestamp: true })
          server.ws.send({ type: 'full-reload' })
        }, 150))
      }

      for (const [dir, pattern] of [[DATA_DIR, /\.json$/], [ARTICLES_DIR, /\.md$/]]) {
        const realDir = await fs.realpath(dir)
        const watcher = watch(realDir, { recursive: true }, (_event, filename) => {
          if (filename && pattern.test(filename) && !path.basename(filename).startsWith('.')) {
            onChange(path.join(realDir, filename))
          }
        })
        server.httpServer?.on('close', () => watcher.close())
      }
    },
  }
}
