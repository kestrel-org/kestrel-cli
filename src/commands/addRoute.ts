import { Command } from '@src/types/command'
import {
  AddRoutePrompts,
  Database,
  PathObject,
  PromptsModels,
  Route,
} from '@src/types/commands/addRoute'
import dotenv from 'dotenv'
import util from 'util'
import url from 'url'
import { ProjectUse } from '@src/types/project'

import {
  sequelizeUtils,
  getPrompts,
  buildTemplateProperties,
  updateRoutes,
  generateUtils,
} from '@src/assets/addroute/functions.js'

const { getAllModels } = sequelizeUtils

const {
  generateSwaggerFile,
  generateTestFile,
  generateRouterFile,
  generateServiceFiles,
} = generateUtils

const addRoute: Command = {
  name: 'addRoute',
  aliases: ['addr'],
  scope: 'in',
  needs: ['backend'],
  arguments: [
    {
      name: 'router-name',
      description: 'Name of the new route',
      required: false,
    },
  ],
  description: 'Generate a new router',
  run: async (toolbox, options, args, command) => {
    const {
      print: { infoLoader, warn },
      fileSystem: { exists, separator },
      saveLog,
      prompts,
      strings: { upperFirst },
      path,
      project: { frontend_path },
      exit,
    } = toolbox

    const { backend_path } = toolbox.project as ProjectUse

    const pattern = /^([-_A-z]+\/)*[-_A-z]{3,}$/g

    function isFilePath(path: string): boolean {
      let is_file_path = pattern.test(path)
      if (!is_file_path) {
        const errorMsg = [
          `${router_name} is not a valid name. Use letters case, slashes, dashes and underscore only.`,
          'The name should also be more than 3 caracters long.',
          `Example: kc addRoute example/my-router`,
        ]
        exit(command, errorMsg)
      }
      return is_file_path
    }

    let router_name: string = args[0]
    // Sanity check
    if (router_name) {
      isFilePath(router_name)
    } else {
      do {
        router_name = await prompts.ask(
          'Name of the router ?',
          undefined,
          'example/my-router'
        )
      } while (!isFilePath(router_name))
    }

    // All paths to needed files such as the project routes folder

    const src = path.join(backend_path, 'src/')
    const routes_folder = path.join(src, 'routes')
    const models_folder = path.join(src, 'models')

    const routes: Route[] = // @ts-ignore
      (await import(url.pathToFileURL(path.join(routes_folder, 'routes.js'))))
        .default

    const router_file_path = path.join(routes_folder, `${router_name}.js`)
    const router_file = router_name.split(separator).pop()

    if (!router_file) {
      return exit(command, 'Cannot find router file !')
    }

    // Front paths
    const service_name = path.basename(router_file)
    const front_src = path.join(frontend_path || '', 'src')
    const services_path = path.join(front_src, 'app/services')
    const service_path = path.join(services_path, service_name, service_name)

    const tests_path = path.join(backend_path, 'tests')

    dotenv.config({ path: path.join(backend_path, '.env') })

    const database: Database = // @ts-ignore
      (await import(url.pathToFileURL(path.join(models_folder, 'index.js'))))
        .default

    // Check if router already exist

    if (exists(router_file_path)) {
      warn(`A router named ${router_file} already exists !`)
      const overwr = await prompts.confirm('Overwrite ?')
      if (!overwr) {
        return undefined
      }
    }

    // Get all models to prompt the user with

    let models: PromptsModels[] = [
      {
        title: 'None',
        value: false,
      },
    ]
    models = models.concat(getAllModels(database))

    // Prompt user with different questions to build the router

    const questionsPaths: PathObject = {
      src,
      backend_path,
      service_name,
      services_path,
      service_path,
    }

    const responses = await prompts.any<AddRoutePrompts>(
      getPrompts(router_name, models, questionsPaths)
    )

    // Build router from template

    const path_to_model = path
      .relative(path.dirname(router_file_path), models_folder)
      .replace(/\\/g, '/')
    const path_to_app = path
      .relative(path.dirname(router_file_path), src)
      .replace(/\\/g, '/')

    const props = buildTemplateProperties(
      responses,
      database,
      path_to_model,
      path_to_app
    )

    // Generate test file for the backend
    if (
      responses.createTest &&
      (responses.testOverwrite === undefined || responses.testOverwrite)
    ) {
      const test_file = path.join(tests_path, `${router_name}.spec.js`)
      await generateTestFile(props, test_file)
    }

    await generateRouterFile(props, router_file_path)

    // Generate swagger model definition

    if (responses.model) {
      const swag_file = path.join(
        src,
        'routes/swaggerModels',
        upperFirst(responses.model) + '.js'
      )
      await generateSwaggerFile(props, swag_file)
    }

    // If frontend available run code

    if (
      responses.createService &&
      (responses.serviceOverwrite === undefined || responses.serviceOverwrite)
    ) {
      // Define all paths for the files needed to create the service

      const frontPaths = {
        front_src,
        service_path,
        service_name,
      }

      await generateServiceFiles(props, frontPaths)
    }

    //  Modify routes.js file

    const new_routes = updateRoutes(
      routes,
      router_name,
      Object.fromEntries(Object.entries(responses).slice(0, 3))
    )

    toolbox.loader.start(infoLoader('Adding route to the routes'))
    await saveLog.write({
      target: path.join(routes_folder, 'routes.js'),
      content: 'export default ' + util.inspect(new_routes),
    })
    await toolbox.loader.succeed()
  },
}

export default addRoute
