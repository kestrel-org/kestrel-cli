import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'

const command: Command = {
  name: 'doc',
  scope: 'in',
  needs: ['frontend'],
  options: [
    {
      flags: '-s, --serve',
      description: 'Serve the documentation',
    },
  ],
  description: 'Build the documentation for the frontend',
  run: async (toolbox, options, args) => {
    const {
      system: { spawn },
      print: { info, log, infoLoader },
      saveLog: { run },
      path,
    } = toolbox

    const { frontend_path } = toolbox.project as ProjectUse

    const docPath = path.join(frontend_path, 'documentation')
    if (options.serve) {
      info('Serving documentation')
      await spawn({
        commandLine: 'npx',
        args: 'compodoc -p src/tsconfig.compodoc.json -n Template-Frontend -s',
        options: {
          shell: true,
          cwd: frontend_path,
          stdio: 'inherit',
        },
      })
    } else {
      toolbox.loader.start(infoLoader('Generating documentation'))
      let generate_doc = await run({
        command: 'npx',
        args: 'compodoc -p src/tsconfig.compodoc.json -n Template-Frontend',
        target: docPath,
        options: {
          cwd: frontend_path,
        },
      })
      await toolbox.loader.succeed()

      const docLog = generate_doc.split('\n')
      log(docLog.slice(-1).join('\n'))
    }
  },
}

export default command
