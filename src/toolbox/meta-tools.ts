import { KcMeta } from '@src/types/toolbox/meta-tools'
import { fileSystem } from './filesystem-tools.js'
import path from 'path'
import url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
// Get cli version
function findVersion(): string {
  const packageJson = fileSystem.read(`${__dirname}/../../package.json`, 'json')
  return packageJson.version
}
const version = findVersion()

/**
 * Base directory for the kestrel-cli
 */
const directory = path.join(__dirname, '../..')

const meta: KcMeta = {
  version,
  directory,
}
export { meta, KcMeta }
