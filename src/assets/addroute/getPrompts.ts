import toolbox from '@src/toolbox/toolbox.js'
import { PathObject, PromptsModels } from '@src/types/commands/addRoute'
import prompts from 'prompts'

/**
 * Returns questions to prompt the user with
 * @param router_name Name of the router to be created
 * @param models All sequelize models available
 * @param paths Path needed for the backend and the frontend
 * @returns Questions to be passed in toolbox.prompts
 */
function getPrompts(
  router_name: string,
  models: PromptsModels[],
  paths: PathObject
): prompts.PromptObject[] {
  const {
    fileSystem: { exists, find },
    print: { warn },
    strings: { upperFirst },
    path,
    project: { def_content },
  } = toolbox

  let questions: prompts.PromptObject[] = [
    {
      type: 'toggle',
      name: 'checkToken',
      message: 'Token verification support ?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'checkAuthenticated',
      message: 'Check if the user is authenticated ?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      name: 'path',
      initial: router_name.split('/').pop(),
      message: `Path ?`,
    },
    {
      type: 'select',
      name: 'model',
      message: 'Use a model ?',
      choices: models,
      initial: 0,
    },
    {
      type: (prev: any, values: any, prompt: any) => {
        if (prev) {
          return 'multiselect'
        }
        return null
      },
      name: 'crud',
      instructions: false,
      message: 'CRUD',
      hint: 'A - Toggle All, Space - Toggle Select',
      choices: [
        {
          title: 'Create',
          value: 'create',
          selected: true,
        },
        {
          title: 'Read',
          value: 'read',
          selected: true,
        },
        {
          title: 'Update',
          value: 'update',
          selected: true,
        },
        {
          title: 'Delete',
          value: 'delete',
          selected: true,
        },
      ],
    },
  ]

  const testFile: prompts.PromptObject[] = [
    {
      type: 'toggle',
      name: 'createTest',
      message: 'Create a test file ?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: (prev: any, values: any, prompt: any) => {
        if (prev) {
          if (
            exists(
              path.join(paths.backend_path, 'tests', `${router_name}.spec.js`)
            )
          ) {
            return 'toggle'
          }
        }
        return null
      },
      name: 'testOverwrite',
      message: (prev: any, values: any) => {
        const errorMsg = warn('A test file already exist with this name !')
        return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
      },
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
  ]

  const serviceFile: prompts.PromptObject[] = [
    {
      type: () => {
        if (def_content?.projects.frontend_path) {
          return 'toggle'
        }
        return null
      },
      name: 'createService',
      message: 'Create the associated service ?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: (prev: any, values: any, prompt: any) => {
        if (values.createService) {
          const service_found = find(paths.services_path, {
            matching: [
              `${paths.service_name}.service.ts`,
              `${paths.service_name}.service.spec.ts`,
            ],
          })
          if (service_found.length > 0) {
            return 'toggle'
          }
        }
        return null
      },
      name: 'serviceOverwrite',
      message: (prev: any, values: any) => {
        const errorMsg = warn(
          `A service named ${paths.service_name} already exists !`
        )
        return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
      },
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
  ]

  const swaggerFile: prompts.PromptObject[] = [
    {
      type: (prev: any, values: any, prompt: any) => {
        if (
          exists(
            path.join(
              paths.src,
              'routes/swaggerModels',
              upperFirst(values.model) + '.js'
            )
          )
        ) {
          return 'toggle'
        }
        return null
      },
      name: 'swaggerOverwrite',
      message: (prev: any, values: any) => {
        const errorMsg = warn(
          'A swagger definition already exist for this model !'
        )
        return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
      },
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
  ]
  questions.push(...testFile, ...serviceFile, ...swaggerFile)

  return questions
}

export default getPrompts
