import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'
import url from 'url'
import dotenv from 'dotenv'

import {
  sequelizeUtils,
  generateUtils,
  buildTemplateProperties,
} from '@src/assets/addroute/functions.js'

import getPrompts from '@src/assets/swaggerModels/getPrompts.js'
import { SwaggerPrompts } from '@src/types/commands/swaggerModels'

const { getAllModels } = sequelizeUtils
const { generateSwaggerFile } = generateUtils

const command: Command = {
  name: 'swaggerModels',
  aliases: ['swagm'],
  scope: 'in',
  needs: ['backend'],
  description: 'Create new swagger model for the swagger api',
  run: async (toolbox) => {
    const {
      prompts,
      strings: { upperFirst },
      path,
    } = toolbox

    const { backend_path } = toolbox.project as ProjectUse

    const backend_src = path.join(backend_path, 'src')
    const models_folder = path.join(backend_src, 'models')
    const swaggerModels = path.join(backend_src, 'routes/swaggerModels')

    dotenv.config({ path: path.join(backend_path, '.env') })

    const database = await import(
      // @ts-ignore
      url.pathToFileURL(path.join(models_folder, 'index.js'))
    )

    const models = getAllModels(database.default)

    const responses = await prompts.any<SwaggerPrompts>(
      getPrompts(models, swaggerModels)
    )

    const file_path = path.join(
      swaggerModels,
      upperFirst(responses.model) + '.js'
    )
    const props = buildTemplateProperties(responses.model, database.default)

    if (
      responses.swaggerOverwrite !== undefined &&
      responses.swaggerOverwrite == false
    )
      return undefined
    await generateSwaggerFile(props, file_path)
  },
}
export default command
