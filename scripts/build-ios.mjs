import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'

const target = new URL('../dist/ios/', import.meta.url)
await mkdir(target, { recursive: true })
for (const file of ['app.js', 'catalog.js', 'domain.js', 'style.css', 'icon.svg', 'manifest.webmanifest', 'privacy.html']) {
  await cp(new URL('../' + file, import.meta.url), new URL(file, target))
}
const leaflet = new URL('../node_modules/leaflet/dist/', import.meta.url)
await cp(leaflet, new URL('leaflet/', target), { recursive: true })
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
await writeFile(new URL('index.html', target), html
  .replace(/https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\//g, './leaflet/')
  .replace(/ integrity="[^"]+" crossorigin=""/g, ''))
