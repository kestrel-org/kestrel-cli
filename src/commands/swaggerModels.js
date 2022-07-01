const {
  sequelizeUtils : {getAllModels}, 
  generateUtils : {generateSwaggerFile}, 
  buildTemplateProperties
} =  require('../assets/addRoute/functions')
const url = require('url');

const command = {
  name: 'swaggerModels',
  alias:['swagm'],
  scope : "in",
  needs : ["backend"],
  description : "Create new swagger model for the swagger api",
  run: async toolbox => {
    const {
      filesystem: { exists },
      prompts : {any},
      prints : {warn},
      strings : { upperFirst },
      path,
      project : {
        backend_path
      }
    } = toolbox
  
    const backend_src = path.join(backend_path,"src");
    const models_folder = path.join(backend_src,"models")
    const swaggerModels = path.join(backend_src,"routes/swaggerModels");

    require('dotenv').config({ path: path.join(backend_path,".env") });
    const database = await import(url.pathToFileURL(path.join(models_folder,"index.js")))

    const models = getAllModels(database.default);

    const {model,swaggerOverwrite} = await any([
      {
        type: 'select',
        name: 'model',
        message: 'Select a model',
        choices: models,
        initial: 0
      },
      {
        type: (prev, values, prompt) => {
            if(exists(path.join(path.join(swaggerModels,upperFirst(values.model)+'.js')))){
                return "toggle";
            }   
            return null;
        },
        name: 'swaggerOverwrite',
        message: (prev, values) => {
            const errorMsg = warn('A swagger definition already exist for this model !')
            return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
        },
        initial: false,
        active: 'yes',
        inactive: 'no'
      }
    ])
    
    const file_path = path.join(swaggerModels,upperFirst(model)+'.js');
    const props = buildTemplateProperties(model,database.default);

    if(swaggerOverwrite!==undefined && swaggerOverwrite==false)
      return undefined
    await generateSwaggerFile(toolbox,props,file_path);
  
  }
}
module.exports = command
