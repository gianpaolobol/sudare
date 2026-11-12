import { categories, venues } from './catalog.js'
import { center, distanceLabel, filterVenues, osmLink } from './domain.js'

const app = document.querySelector('#app')
const dialog = document.querySelector('#suggest')
const state = { category: 'tutti', query: '', origin: center, radius: 0, map: false, locating: false, status: 'Distanze dal centro di Bologna.' }
const storageKey = 'sudare-favourites-v1'
let map
let saved
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  saved = new Set(Array.isArray(stored) ? stored : [])
} catch {
  saved = new Set()
}

const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char])
const external = 'target="_blank" rel="noopener"'
const attribution = '<p class="credits">Mappa e coordinate © <a href="https://www.openstreetmap.org/copyright" ' + external + '>OpenStreetMap contributors</a></p>'
const options = [[0, 'Tutta Bologna'], [1000, 'Entro 1 km'], [3000, 'Entro 3 km'], [5000, 'Entro 5 km']]
const label = type => categories[type].label
const details = venue => '#locale/' + venue.id
const mark = type => `<span class="mark" aria-hidden="true">${categories[type].icon}</span>`

function favourite(venue) {
  const active = saved.has(venue.id)
  return `<button type="button" class="favourite" data-save="${venue.id}" aria-pressed="${active}" aria-label="${active ? 'Rimuovi dai salvati' : 'Salva'} · ${esc(venue.name)}"><span aria-hidden="true">${active ? '♥' : '♡'}</span></button>`
}

function cards(items) {
  return items.map(venue => `<article class="card">
    <a class="card-open" href="${details(venue)}">${mark(venue.types[0])}<div>
      <h2>${esc(venue.name)}</h2><p>${esc(venue.address)}</p>
      <p>${esc(venue.styles)}${Number.isFinite(venue.metres) ? ' · ' + distanceLabel(venue.metres) : ''}</p>
    </div></a>${favourite(venue)}
  </article>`).join('')
}

function rail() {
  return `<aside class="rail" aria-label="Categorie">
    <div class="categories">${Object.entries(categories).map(([id, category]) =>
      `<button type="button" data-category="${id}" aria-pressed="${state.category === id}">
        ${id === 'tutti' ? '<img src="./icon.svg" alt="">' : `<span aria-hidden="true">${category.icon}</span>`}
        ${category.label}</button>`).join('')}</div>
    <button type="button" id="add" aria-label="Segnala un locale" title="Segnala un locale">＋</button>
  </aside>`
}

function discovery() {
  return `<div class="layout">${rail()}
    <section class="results" aria-labelledby="heading">
      <h1 id="heading">Dove si balla?</h1>
      <label class="search"><span class="sr-only">Cerca locale, indirizzo o stile di ballo</span><input type="search" id="query" value="${esc(state.query)}" placeholder="Cerca un locale o un ballo"></label>
      <div class="tools">
        <button type="button" id="locate"${state.locating ? ' disabled' : ''}>${state.locating ? 'Localizzo…' : '⌖ Vicino a me'}</button>
        <select id="radius" aria-label="Distanza">${options.map(([value, name]) => `<option value="${value}" ${state.radius === value ? 'selected' : ''}>${name}</option>`).join('')}</select>
      </div>
      <p id="location-status" class="status" role="status">${esc(state.status)}</p>
      <div class="result-head">
        <p id="count" role="status"></p>
        <button id="view-map" type="button" aria-pressed="${state.map}">${state.map ? 'Mostra lista' : 'Mostra mappa'}</button>
      </div>
      <div id="results"></div>
      ${attribution}
    </section>
  </div>`
}

function detail(venue, back) {
  const metres = filterVenues([venue], { ...state, category: 'tutti', query: '', radius: 0 })[0].metres
  return `<section class="page">
    <a class="back" href="#${back}">← ${back === 'salvati' ? 'Salvati' : 'Scopri'}</a>
    <div class="detail-title">${mark(venue.types[0])}<h1>${esc(venue.name)}</h1>${favourite(venue)}</div>
    <p class="tags">${venue.types.map(type => `<span>${label(type)}</span>`).join('')}</p>
    <p>${esc(venue.address)} · Bologna${Number.isFinite(metres) ? ' · ' + distanceLabel(metres) : ''}</p>
    <p>${esc(venue.styles)}</p>
    ${venue.note ? `<p class="status">${esc(venue.note)}</p>` : ''}
    <div class="actions">
      <a class="primary" href="${esc(osmLink(venue))}" ${external}>Apri in OpenStreetMap ↗</a>
      ${venue.point ? `<a href="https://www.openstreetmap.org/directions?to=${venue.point.lat},${venue.point.lon}" ${external}>Indicazioni ↗</a>` : ''}
      ${venue.site ? `<a href="${esc(venue.site)}" ${external}>Sito del locale ↗</a>` : ''}
      <a href="${esc(venue.source)}" ${external}>Fonte della scheda ↗</a>
    </div>${attribution}
  </section>`
}

let lastTab = 'scopri'
function render() {
  const route = location.hash.slice(1)
  const venue = route.startsWith('locale/') && venues.find(v => details(v).slice(1) === route)
  const view = venue ? lastTab : route === 'salvati' ? 'salvati' : 'scopri'
  if (!venue) lastTab = view
  const discoveryOpen = !venue && view === 'scopri'
  app.className = discoveryOpen ? 'discovery' : ''
  document.querySelectorAll('[data-tab]').forEach(tab => {
    if (tab.dataset.tab === view) tab.setAttribute('aria-current', 'page')
    else tab.removeAttribute('aria-current')
  })
  destroyMap()
  if (venue) app.innerHTML = detail(venue, view)
  else if (view === 'salvati') {
    const items = filterVenues(venues.filter(v => saved.has(v.id)), { ...state, category: 'tutti', query: '', radius: 0 })
    app.innerHTML = `<section class="page"><h1>Salvati</h1>${items.length ? cards(items) : '<p>I locali che salvi con il cuore li ritrovi qui.</p>'}</section>`
  } else {
    app.innerHTML = discovery()
    updateResults()
  }
  app.scrollTop = 0
}

function destroyMap() {
  if (map) map.remove()
  map = undefined
}

function showMap(target, items) {
  const points = items.filter(v => v.point)
  if (!window.L || !points.length) {
    target.innerHTML = '<p class="status">' + (!window.L ? 'Mappa non disponibile in questo momento.' : 'Nessun punto sulla mappa per questi filtri.') + '</p>' + cards(items)
    return
  }
  target.innerHTML = '<div id="map" aria-label="Mappa dei locali da ballo"></div>' + cards(items)
  map = L.map('map', { scrollWheelZoom: false })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
  const locations = new Map()
  for (const venue of points) {
    const key = venue.point.lat + ',' + venue.point.lon
    if (!locations.has(key)) locations.set(key, [])
    locations.get(key).push(venue)
  }
  const bounds = []
  for (const nearby of locations.values()) {
    const { lat, lon } = nearby[0].point
    bounds.push([lat, lon])
    const popup = document.createElement('div')
    for (const venue of nearby) {
      const line = document.createElement('div')
      const link = document.createElement('a')
      link.href = details(venue)
      link.textContent = venue.name
      line.append(link)
      popup.append(line)
    }
    const title = nearby.map(venue => venue.name).join(' · ')
    L.marker([lat, lon], { title, alt: title }).bindPopup(popup).addTo(map)
  }
  map.fitBounds(bounds, { padding: [26, 26], maxZoom: 16 })
}

function updateResults() {
  const target = app.querySelector('#results')
  if (!target) return
  const items = filterVenues(venues, state)
  app.querySelector('#count').textContent = items.length + (items.length === 1 ? ' locale' : ' locali')
  destroyMap()
  if (!items.length) target.innerHTML = '<p class="empty">Nessun locale con questi filtri.</p>'
  else if (state.map) showMap(target, items)
  else target.innerHTML = cards(items)
}

function locate() {
  if (!navigator.geolocation) {
    state.status = 'Posizione non disponibile. Le distanze partono dal centro di Bologna.'
    render()
    return
  }
  state.locating = true
  render()
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    state.origin = { lat: coords.latitude, lon: coords.longitude }
    state.radius = 1000
    state.locating = false
    state.status = 'Distanze dalla tua posizione.'
    render()
  }, () => {
    state.locating = false
    state.status = 'Posizione non disponibile. Puoi comunque consultare i locali di Bologna.'
    render()
  }, { timeout: 10000, maximumAge: 30000 })
}

function suggest() {
  dialog.innerHTML = `<form method="dialog">
    <h2>Segnala un locale da ballo</h2>
    <p>Indica il nome, l’indirizzo e un link che confermi le attività di ballo.</p>
    <div class="actions"><a class="primary" href="https://github.com/gianpaolobol/sudare/issues/new" ${external}>Apri una segnalazione su GitHub ↗</a>
    <button type="submit">Chiudi</button></div>
  </form>`
  dialog.showModal()
}

app.addEventListener('click', event => {
  const button = event.target.closest('button')
  if (!button) return
  if (button.dataset.save) {
    const id = button.dataset.save
    if (saved.has(id)) saved.delete(id)
    else saved.add(id)
    try { localStorage.setItem(storageKey, JSON.stringify([...saved])) } catch {}
    if (location.hash === '#salvati') render()
    else {
      const venue = venues.find(v => v.id === id)
      button.outerHTML = favourite(venue)
      app.querySelector(`[data-save="${id}"]`)?.focus({ preventScroll: true })
    }
  }
  if (button.dataset.category) {
    state.category = button.dataset.category
    app.querySelectorAll('[data-category]').forEach(element => {
      element.setAttribute('aria-pressed', String(element === button))
    })
    updateResults()
  }
  if (button.id === 'locate') locate()
  if (button.id === 'view-map') {
    state.map = !state.map
    button.textContent = state.map ? 'Mostra lista' : 'Mostra mappa'
    button.setAttribute('aria-pressed', String(state.map))
    updateResults()
  }
  if (button.id === 'add') suggest()
})

app.addEventListener('input', event => {
  if (event.target.id !== 'query') return
  state.query = event.target.value
  updateResults()
})
app.addEventListener('change', event => {
  if (event.target.id !== 'radius') return
  state.radius = Number(event.target.value)
  updateResults()
})
window.addEventListener('hashchange', render)
render()
