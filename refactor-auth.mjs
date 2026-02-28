import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const args = process.argv.slice(2)
const dir = args[0] || 'apps/web/src'

async function walk(dir) {
    let results = []
    const list = await fs.readdir(dir)
    for (const file of list) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath)
        if (stat && stat.isDirectory()) {
            results = results.concat(await walk(filePath))
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                results.push(filePath)
            }
        }
    }
    return results
}

async function run() {
    const files = await walk(dir)
    let changed = 0
    for (const file of files) {
        let content = await fs.readFile(file, 'utf8')
        let orig = content
        let didChange = false

        // Replace getServerSession(authOptions) with auth()
        if (content.includes('getServerSession(authOptions)')) {
            content = content.replace(/getServerSession\(authOptions\)/g, 'auth()')
            didChange = true
        }

        // Replace the import
        if (content.includes("import { getServerSession } from 'next-auth'")) {
            content = content.replace("import { getServerSession } from 'next-auth'", "import { auth } from '@/lib/auth'")
            didChange = true
        }

        // Remove `import { authOptions } from ...` if it is present
        if (content.match(/import\s+{\s*authOptions\s*}\s+from\s+['"].*['"]/)) {
            content = content.replace(/import\s+{\s*authOptions\s*}\s+from\s+['"].*['"]\n?/g, '')
            didChange = true
        }

        if (didChange) {
            await fs.writeFile(file, content, 'utf8')
            console.log(`Updated: ${file}`)
            changed++
        }
    }
    console.log(`Updated ${changed} files.`)
}

run().catch(console.error)
