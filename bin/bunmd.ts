#!/usr/bin/env bun
if (typeof Bun === 'undefined' || !process.versions.bun) {
	throw new Error('This app needs to be executed with Bun.')
}

import { parseArgs } from 'node:util'
import { join, isAbsolute } from 'node:path'
import { mkdtemp, rm, symlink, stat } from 'node:fs/promises'
import { tmpdir } from 'os'

const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		port: {
			short: 'p',
			type: 'string',
		},
		preserve: {
			default: false,
			type: 'boolean',
		},
	},
	strict: true,
	allowPositionals: true,
})

if (typeof positionals[2] !== 'string') throw new Error('Need a file!')

const mdPath = isAbsolute(positionals[2])
	? positionals[2]
	: join(process.cwd(), positionals[2])
console.log(mdPath)
if ((await stat(mdPath)).isDirectory())
	throw new Error('Directory input is not supported.')
if (!(await Bun.file(mdPath).exists())) throw new Error('File does not exist!')

const port = Number(values.port ?? 4000)

const PROJECTDIR = join(import.meta.dir, '..')
const TMPDIR = await mkdtemp(join(tmpdir(), 'bunmd-'))
const GENDIR = join(import.meta.dir, '../gen')

// const bunfigPath = join(TMPDIR, `bunfig.toml`)
// await Bun.file(bunfigPath).write(`[serve.static]\nplugins = ['bunmd']`)
await symlink('/x/g/bunmd/css/github-markdown.css', join(TMPDIR, 'style.css'))
const serverPath = join(TMPDIR, `server.ts`)
const htmlPath = join(TMPDIR, `index.html`)
const tsPath = join(TMPDIR, `main.ts`)

const server = await Bun.file(join(GENDIR, 'server.ts')).text()
const html = await Bun.file(join(GENDIR, 'index.html')).text()
const ts = await Bun.file(join(GENDIR, 'main.ts')).text()

await Bun.file(serverPath).write(server)
await Bun.file(htmlPath).write(html)
await Bun.file(tsPath).write(ts.replaceAll('{{mdPath}}', mdPath))

const childProc = Bun.spawn(['bun', serverPath], {
	cwd: PROJECTDIR,
	env: {
		BUN_PORT: String(port),
	},
	stdout: 'inherit',
})

process.on('SIGINT', async () => {
	childProc.kill()
	if (!values.preserve) {
		await rm(TMPDIR, { recursive: true, force: true })
	}
})
