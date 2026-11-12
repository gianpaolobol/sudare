import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { categories, venues } from './catalog.js'
import { center, distance, distanceLabel, filterVenues, osmLink } from './domain.js'

const defaults = { category: 'tutti', query: '', origin: center, radius: 0 }

test('the catalogue has unique IDs, known categories, sources and Bologna coordinates', () => {
  assert.equal(new Set(venues.map(v => v.id)).size, venues.length)
  for (const venue of venues) {
    assert.ok(venue.types.length && venue.types.every(type => type !== 'tutti' && categories[type]))
    assert.equal(new URL(venue.source).protocol, 'https:')
    assert.ok(venue.point.lat > 44.4 && venue.point.lat < 44.6)
    assert.ok(venue.point.lon > 11.2 && venue.point.lon < 11.5)
  }
})

test('category, text and radius filters combine and rank by distance', () => {
  const result = filterVenues(venues, { ...defaults, category: 'balere', query: 'filuzzi' })
  assert.ok(result.some(v => v.id === 'tropical-balera'))
  assert.ok(result.every(v => v.types.includes('balere')))
  const nearby = filterVenues(venues, { ...defaults, origin: venues[0].point, radius: 1000 })
  assert.equal(nearby[0].id, venues[0].id)
  assert.ok(nearby.every((v, i) => v.metres <= 1000 && (!i || v.metres >= nearby[i - 1].metres)))
})

test('distance formatting and OpenStreetMap links use the catalogue coordinates', () => {
  assert.equal(distance(center, center), 0)
  assert.equal(distanceLabel(1250), '1,3 km')
  const venue = venues[0]
  assert.equal(new URL(osmLink(venue)).searchParams.get('mlat'), String(venue.point.lat))
})
