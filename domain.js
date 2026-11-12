export const center = { lat: 44.4949, lon: 11.3426 }
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function distance(a, b) {
  const radians = degrees => degrees * Math.PI / 180
  const halfLat = radians(b.lat - a.lat) / 2
  const halfLon = radians(b.lon - a.lon) / 2
  const h = Math.sin(halfLat) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(halfLon) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)))
}

export function filterVenues(venues, { category, query, origin, radius }) {
  const needle = normalize(query.trim())
  return venues
    .filter(v => category === 'tutti' || v.types.includes(category))
    .filter(v => normalize([v.name, v.address, v.styles].join(' ')).includes(needle))
    .map(v => ({ ...v, metres: v.point ? distance(origin, v.point) : Infinity }))
    .filter(v => !radius || v.metres <= radius)
    .sort((a, b) => a.metres - b.metres || a.name.localeCompare(b.name, 'it'))
}

export function osmLink(venue) {
  if (!venue.point) {
    return 'https://www.openstreetmap.org/search?' + new URLSearchParams({ query: venue.address.split(' · ')[0] + ', Bologna' })
  }
  const { lat, lon } = venue.point
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
}

export function distanceLabel(metres) {
  if (!Number.isFinite(metres)) return ''
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toLocaleString('it', { maximumFractionDigits: 1 })} km`
}
