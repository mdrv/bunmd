import factory from './factory.ts'
import type { BunPlugin } from 'bun'

const plugin: BunPlugin = factory()
export default plugin
