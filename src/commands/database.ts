import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'
import dotenv from 'dotenv'

const command: Command = {
  name: 'database',
  aliases: ['db'],
  scope: 'in',
  needs: ['backend'],
  options: [
    {
      flags: '--env <env>',
      description: 'Run in specified env.',
      choices: ['dev', 'test', 'prod'],
      default: 'dev',
    },
    {
      flags: '--args <args>',
      description: 'Args for the Sequelize-cli command',
    },
  ],
  arguments: [
    {
      name: 'command',
      description: 'Sequelize command',
      required: true,
    },
  ],
  foldersToWatch: { backend: ['src/models', 'src/seeders', 'src/migrations'] },
  description: 'Generate commands based on sequelize instructions',
  run: async (toolbox, options, args, command) => {
    const {
      saveLog: { run },
      print: { log, infoLoader },
      strings: { upperCase, lowerCase },
      path,
      exit,
    } = toolbox

    const { backend_path } = toolbox.project as ProjectUse

    let sqlzArgs: string
    let runCmd: string
    let command_name = args[0]

    // Run added Command generate:models which is not a sequelize cli command
    if (command_name == 'generate:models') {
      if (options.args) {
        const errorMsg = [
          "Can't use option --args with the command 'generate:models'",
        ]
        exit(command, errorMsg)
      }

      let env = upperCase(options.env)

      dotenv.config({ path: path.join(backend_path, '.env') })

      const available_envs = ['DEV', 'TEST', 'PROD']
      let env_vars = ['DB_SCHEMA_', 'DB_USERNAME_', 'DB_PASSWORD_']

      if (!available_envs.includes(env)) {
        const erroMsg = [
          'Specified environment does not exist',
          `Available environments : ${available_envs.join(',')}`,
        ]
        exit(command, erroMsg)
      }

      env_vars = env_vars.map((evar) => {
        if (!process.env[`${evar + env}`]) {
          exit(
            command,
            `Environment variable '${evar + env}' was not set corectly.`
          )
        }
        return `${evar + env}`
      })

      env = lowerCase(env)
      runCmd = 'node'
      sqlzArgs = [
        'node_modules/sequelize-auto/bin/sequelize-auto -o "./src/models" -d',
        process.env[env_vars[0]],
        '-h localhost -u',
        process.env[env_vars[1]],
        '-p 3306 -x',
        process.env[env_vars[2]],
        '-e mysql --skipTables sequelizemeta --noInitModels',
      ].join(' ')
      command_name = 'generate-models'
    } else {
      runCmd = 'npx'
      options.args = options.args ? options.args : ''
      sqlzArgs = `sequelize-cli ${command_name} ${options.args}`.trim()
      command_name = `${command_name} ${options.args}`
    }
    toolbox.loader.start(
      infoLoader(`Running sequelize command : ${command_name}`)
    )
    let sequelize_cmd = await run({
      command: runCmd,
      args: sqlzArgs,
      options: {
        cwd: backend_path,
      },
    })
    await toolbox.loader.succeed()
    log(sequelize_cmd)
  },
}

export default command
