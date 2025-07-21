import factory from 'bunmd/factory'
import type { BunPlugin } from 'bun'

const plugin: BunPlugin = factory({ lines: 'double' })
export default plugin
