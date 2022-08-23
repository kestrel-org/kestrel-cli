import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'
import dotenv from 'dotenv'

const command: Command = {
  name: 'initdb',
  aliases: ['idb'],
  scope: 'in',
  needs: ['backend'],
  foldersToWatch: { backend: ['src/models', 'src/seeders', 'src/migrations'] },
  options: [
    {
      flags: '--env <env>',
      description: 'Env to use when initialising the database.',
      choices: ['dev', 'test', 'prod'],
      default: 'dev',
    },
    {
      flags: '--ignore-list, --il',
      description: 'Ignore all or several seeders during init.',
    },
  ],
  description: 'Init database with fake data.',
  run: async (toolbox, options, args, command) => {
    const {
      strings: { upperCase, lowerCase },
      print: { info, infoLoader, error, log },
      saveLog,
      path,
      system: { run },
      exit,
      fileSystem: { listAsync },
      prompts: { multiSelect },
    } = toolbox

    const { backend_path } = toolbox.project as ProjectUse

    dotenv.config({ path: path.join(backend_path, '.env') })

    let env = upperCase(options.env)

    const available_envs = ['DEV', 'TEST', 'PROD']
    let env_vars = ['DB_SCHEMA_', 'DB_USERNAME_', 'DB_PASSWORD_']

    // Sanity check
    if (env) {
      if (!available_envs.includes(env)) {
        const errorMsg = [
          'Specified environment does not exist',
          `Available environments : ${available_envs.join(',')}`,
        ]
        exit(command, errorMsg)
      }
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

    let seeders = await listAsync(path.join(backend_path, 'src/seeders'))

    if (options.il) {
      const ignored: string[] = await multiSelect(
        'Select seeders to ignore',
        seeders,
        undefined,
        true
      )
      seeders = seeders!.filter((value) => {
        return !ignored.includes(value)
      })
    }

    info('---- Database Initialization ----')

    toolbox.loader.start(infoLoader('Database removal'))
    let db_removal = await run('npx', `sequelize-cli db:drop --env ${env}`, {
      cwd: backend_path,
    })
    await toolbox.loader.succeed()
    log(db_removal)

    toolbox.loader.start(infoLoader('Database generation'))
    let db_gen = await run('npx', `sequelize-cli db:create --env ${env}`, {
      cwd: backend_path,
    })
    await toolbox.loader.succeed()
    log(db_gen)

    toolbox.loader.start(infoLoader('Tables generation'))
    let tables_gen = await run('npx', `sequelize-cli db:migrate --env ${env}`, {
      cwd: backend_path,
    })
    await toolbox.loader.succeed()
    log(tables_gen)

    toolbox.loader.start(infoLoader('Models generation'))
    let models_gen = await saveLog.run({
      command: 'node',
      args: `node_modules/sequelize-auto/bin/sequelize-auto -o \"./src/models\" -d ${process
        .env[env_vars[0]]!} -h localhost -u ${process.env[
        env_vars[1]
      ]!} -p 3306 -x ${process.env[
        env_vars[2]
      ]!} -e mysql --skipTables sequelizemeta --noInitModels`,
      options: {
        cwd: backend_path,
      },
    })
    await toolbox.loader.succeed()
    log(models_gen)

    if (seeders!.length > 0) {
      let seedCmd = `db:seed --seed ${seeders!.join(' ')}`

      toolbox.loader.start(infoLoader('Data insertion'))
      let data_gen = await run('npx', `sequelize-cli ${seedCmd} --env ${env}`, {
        cwd: backend_path,
      })
      await toolbox.loader.succeed()
      log(data_gen)
    }
    info('Database initialized !')
  },
}

export default command
