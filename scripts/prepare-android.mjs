import { readFile, writeFile } from 'node:fs/promises'

const manifest = new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url)
const locationPermissions = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION'
]
const contents = await readFile(manifest, 'utf8')
const missingPermissions = locationPermissions
  .filter(permission => !contents.includes(`android:name="${permission}"`))
  .map(permission => `    <uses-permission android:name="${permission}" />`)

if (missingPermissions.length) {
  const closingTag = '</manifest>'
  if (!contents.includes(closingTag)) {
    throw new Error('Android manifest is missing its closing tag')
  }
  await writeFile(manifest, contents.replace(closingTag, [...missingPermissions, closingTag].join('\n')))
}
