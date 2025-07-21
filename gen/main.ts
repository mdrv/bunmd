import md from '{{mdPath}}'
console.log(window.location.pathname)

const app = import.meta.hot.data.app ??= document.getElementById('app');
app.innerHTML = md

import.meta.hot.accept('{{mdPath}}', M => {
	app.innerHTML = M.default
})
