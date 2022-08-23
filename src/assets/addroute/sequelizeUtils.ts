import toolbox from '@src/toolbox/toolbox.js'
import { Database, PromptsModels } from '@src/types/commands/addRoute'

const {
  strings: { upperFirst },
} = toolbox

/**
 * Retrieve a sequelize model
 * @param model Model to get
 * @param database Sequelize Database
 * @returns A particular sequelize model as a usable object
 */
export function getSequelizeModel(model: string, database: Database): any {
  return database.sequelize.model(model)
}

/**
 * Retrieve all sequelize models as prompts object
 * @param database Sequelize Database
 * @returns models
 */
export function getAllModels(database: Database): PromptsModels[] {
  let models: PromptsModels[] = []
  for (let model in database.sequelize.models) {
    models.push({
      title: upperFirst(model),
      value: model,
    })
  }
  return models
}

export default {
  getSequelizeModel,
  getAllModels,
}
