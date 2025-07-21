import html from './index.html'

import.meta.hot.accept()
const server = Bun.serve({
	development: {
		hmr: true,
		console: true,
	},
	routes: {
		'/*': html,
	},
})

console.log(`Running on port ${server.port}`)
