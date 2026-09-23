#!/usr/bin/env node
// One-time (or whenever you want to change the password) setup script for
// the deployed admin server. Run on the server itself:
//
//   node server/set-password.mjs <username>
//
// Writes server/credentials.json, which admin-auth-plugin.js reads at
// startup. That file is gitignored and never leaves this machine.

import { randomBytes, scryptSync } from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.resolve(__dirname, 'credentials.json')

const CTRL_C = String.fromCharCode(3)
const BACKSPACE = String.fromCharCode(127)

const username = process.argv[2]
if (!username) {
  console.error('usage: node set-password.mjs <username>')
  process.exit(1)
}

const readHidden = (prompt) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY) {
    reject(new Error('this script must be run interactively'))
    return
  }
  process.stdout.write(prompt)
  const { stdin } = process
  stdin.resume()
  stdin.setRawMode(true)
  stdin.setEncoding('utf8')
  let value = ''
  const onData = (char) => {
    if (char === CTRL_C) {
      stdin.setRawMode(false)
      stdin.pause()
      process.stdout.write('\n')
      process.exit(1)
    }
    if (char === '\r' || char === '\n') {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      process.stdout.write('\n')
      resolve(value)
      return
    }
    if (char === BACKSPACE || char === '\b') {
      value = value.slice(0, -1)
      return
    }
    value += char
  }
  stdin.on('data', onData)
})

const main = async () => {
  const password = await readHidden('New password: ')
  const confirm = await readHidden('Confirm password: ')
  if (password !== confirm) {
    console.error('Passwords did not match.')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.')
    process.exit(1)
  }
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  const data = {
    username,
    salt: salt.toString('hex'),
    hash: hash.toString('hex'),
  }
  mkdirSync(__dirname, { recursive: true })
  writeFileSync(OUT_PATH, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 })
  console.log(`Credentials written to ${OUT_PATH}`)
}

main()
