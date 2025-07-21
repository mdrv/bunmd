import content from './example.md'
console.log(content)
document.getElementById('app').innerHTML = content.join("<hr/>")
