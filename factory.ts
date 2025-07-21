import type { BunPlugin } from 'bun'
import { toMerged } from 'es-toolkit'

type ParserName = 'snarkdown'
type LinesOpt = boolean | 'double' | 'single'

type Opts = {
	/**
	 * Only supports snarkdown at the moment.
	 */
	parser: ParserName
	/**
	 * Parse per line (instead of whole text)
	 * Use 'double' to specify two line breaks.
	 */
	lines: LinesOpt
}

const parsers: Record<ParserName, () => Promise<Function>> = {
	snarkdown: async () => (await import('snarkdown')).default,
}
const preprocess: Record<LinesOpt, () => string | ReadonlyArray<string>> = {
	single: (md) => md.split(/\r?\n/),
	double: (md) => md.split(/\r?\n\r?\n/),
}

const defaultOpts: Opts = {
	parser: 'snarkdown',
	lines: false,
}

const factory = (userOpts: Partial<Opts> = {}): BunPlugin => {
	const opts: Opts = toMerged(defaultOpts, userOpts)
	return {
		name: 'bunmd',
		setup: async (build) => {
			const parse = await parsers[opts.parser]()
			build.onLoad({ filter: /\.(md)$/ }, async (args) => {
				const md = await Bun.file(args.path).text()
				const contents = opts.lines
					? preprocess[opts.lines === true ? 'single' : opts.lines](md).map(
							(l) => parse(l),
						)
					: parse(md)
				return {
					contents: `export default ${JSON.stringify(contents)}`,
					loader: 'js',
				}
			})
		},
	}
}

export default factory
