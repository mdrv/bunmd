import type { BunPlugin } from 'bun'
import { toMerged } from 'es-toolkit'

type ParserName = 'snarkdown'

type Opts = {
	/**
	 * Only supports snarkdown at the moment.
	 */
	parser: ParserName
}

const parsers: Record<ParserName, () => Promise<Function>> = {
	snarkdown: async () => (await import('snarkdown')).default,
}

const defaultOpts: Opts = {
	parser: 'snarkdown',
}

const factory = (userOpts: Partial<Opts> = {}): BunPlugin => {
	const opts: Opts = toMerged(defaultOpts, userOpts)
	return {
		name: 'bunmd',
		setup: async (build) => {
			const parse = await parsers[opts.parser]()
			build.onLoad({ filter: /\.(md)$/ }, async (args) => {
				const md = await Bun.file(args.path).text()
				const contents = parse(md)
				return {
					contents: `export default ${JSON.stringify(contents)}`,
					loader: 'js',
				}
			})
		},
	}
}

export default factory
