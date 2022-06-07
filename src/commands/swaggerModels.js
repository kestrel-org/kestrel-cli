const {getAllModels, generateSwaggerFile, buildTemplateProperties} =  require('../assets/addRoute/functions')
const url = require('url')

const command = {
  name: 'swaggerModels',
  alias:['swagm'],
  scope : "in",
  needs : ["backend"],
  description : "Create new swagger model for the swagger api",
  run: async toolbox => {
    const {
      filesystem: { read },
      prompts,
      strings : { upperFirst },
      path,
      project_def
    } = toolbox
  
    // Get the project defintion as json
    const def_content = read(project_def,"json");
    const {backend_path} = def_content.projects;
    const backend_src = path.join(path.dirname(project_def),backend_path,"src");
    const models_folder = path.join(backend_src,"models")
    const swaggerModels = path.join(backend_src,"routes/swaggerModels");

    require('dotenv').config({ path: path.join(path.dirname(project_def),backend_path,".env") });
    const database = await import(url.pathToFileURL(path.join(models_folder,"index.js")))

    const models = getAllModels(database.default);

    const {model} = await prompts.any({
        type: 'select',
        name: 'model',
        message: 'Select a model',
        choices: models,
        initial: 0
    })
    
    const file_path = path.join(swaggerModels,upperFirst(model)+'.js');
    const props = buildTemplateProperties(model,database.default);

    await generateSwaggerFile(toolbox,props,file_path);
    
    

  }
}
module.exports = command
