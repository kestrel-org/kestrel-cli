import { Command } from '@src/types/command'
import Project from '@src/types/project'

const idCommand: Command = {
  name: 'install-dependencies',
  aliases: ['id'],
  scope: 'in',
  description: 'Install project dependencies',
  run: async (toolbox, options, args) => {
    const {
      project,
      fileSystem: { exists },
      print: { infoLoader, warn },
      prompts,
      system: { run },
      path,
    } = toolbox

    let directories: any = {
      backend_path: undefined,
      frontend_path: undefined,
    }

    for (let dir in directories) {
      if (project.def_content?.projects.hasOwnProperty(dir)) {
        directories[dir] = project[dir as keyof Project]
        if (exists(path.join(directories[dir], 'node_modules'))) {
          warn(
            `The directory ${path.basename(
              directories[dir]
            )} already has dependencies installed !`
          )
          let overwrite = await prompts.confirm('Overwrite ?')
          if (!overwrite) {
            directories[dir] = null
          }
        }
      }
    }

    let overwrite = Object.values(directories).every((prop) => prop === null)
    if (overwrite) {
      return undefined
    }

    for (let dir in directories) {
      if (directories[dir]) {
        toolbox.loader.start(
          infoLoader(
            `Installing ${path.basename(directories[dir])} dependencies`
          )
        )

        await run(`npm`, 'install', {
          cwd: directories[dir],
        })
        await toolbox.loader.succeed()
      }
    }
  },
}

export default idCommand
