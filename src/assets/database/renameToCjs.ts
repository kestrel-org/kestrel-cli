import toolbox from '@src/toolbox/toolbox.js'
import asyncForEach from '@utils/asyncForEach.js'

/**
 * Rename sequelize cli file to fix cjs issue when in esm
 */
async function renameDbFiles() {
  const {
    project: { backend_path },
    fileSystem: { renameAsync, listAsync },
    path,
  } = toolbox

  const modelsPath = path.join(backend_path!, 'src/models')
  const migrationsPath = path.join(backend_path!, 'src/migrations')
  const seedersPath = path.join(backend_path!, 'src/seeders')

  const [models, migrations, seeders] = await Promise.all([
    listAsync(modelsPath),
    listAsync(migrationsPath),
    listAsync(seedersPath),
  ])
  return await Promise.all([
    asyncForEach(models || [], async (file: string) => {
      if (file === 'index.js' || file.slice(-4) === '.cjs') return
      return await renameAsync(
        path.join(modelsPath, file),
        `${file.slice(0, file.lastIndexOf('.'))}.cjs`,
        { overwrite: true }
      )
    }),

    asyncForEach(migrations || [], async (file: string) => {
      if (file.slice(-4) === '.cjs') return
      return await renameAsync(
        path.join(migrationsPath, file),
        `${file.slice(0, file.lastIndexOf('.'))}.cjs`,
        { overwrite: true }
      )
    }),

    asyncForEach(seeders || [], async (file: string) => {
      if (file.slice(-4) === '.cjs') return
      return await renameAsync(
        path.join(seedersPath, file),
        `${file.slice(0, file.lastIndexOf('.'))}.cjs`,
        { overwrite: true }
      )
    }),
  ])
}
export default renameDbFiles
