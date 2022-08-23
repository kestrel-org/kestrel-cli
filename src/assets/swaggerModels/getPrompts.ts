import toolbox from '@src/toolbox/toolbox.js'
import { PromptsModels } from '@src/types/commands/addRoute'
import prompts from 'prompts'
// Returns questions to prompt the user with

/**
 * Returns questions to prompt the user with
 * @param models All sequelize models available
 * @returns Questions to be passed in toolbox.prompts
 */
function getPrompts(
  models: PromptsModels[],
  swaggerModels: string
): prompts.PromptObject[] {
  const {
    fileSystem: { exists },
    print: { warn },
    strings: { upperFirst },
    path,
    prompts: { any },
  } = toolbox

  const questions: prompts.PromptObject[] = [
    {
      type: 'select',
      name: 'model',
      message: 'Select a model',
      choices: models,
      initial: 0,
    },
    {
      type: (prev, values, prompt) => {
        if (
          exists(path.join(swaggerModels, upperFirst(values.model) + '.js'))
        ) {
          return 'toggle'
        }
        return null
      },
      name: 'swaggerOverwrite',
      message: (prev, values) => {
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

  return questions
}

export default getPrompts
