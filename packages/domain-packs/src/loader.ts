import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import type { DomainPack } from '@kauri/shared/types'

const PACKS_DIR = path.join(__dirname, '../packs')

export function loadDomainPack(name: string): DomainPack | null {
  try {
    const filePath = path.join(PACKS_DIR, `${name.toLowerCase()}.yaml`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const pack = yaml.load(fileContents) as DomainPack

    console.log(`✅ Loaded domain pack: ${pack.name}`)
    return pack
  } catch (error) {
    console.error(`❌ Failed to load domain pack "${name}":`, error)
    return null
  }
}

export function listDomainPacks(): string[] {
  try {
    const files = fs.readdirSync(PACKS_DIR)
    return files
      .filter((file) => file.endsWith('.yaml'))
      .map((file) => file.replace('.yaml', ''))
  } catch (error) {
    console.error('❌ Failed to list domain packs:', error)
    return []
  }
}

export function loadAllDomainPacks(): DomainPack[] {
  const packNames = listDomainPacks()
  return packNames
    .map((name) => loadDomainPack(name))
    .filter((pack): pack is DomainPack => pack !== null)
}
