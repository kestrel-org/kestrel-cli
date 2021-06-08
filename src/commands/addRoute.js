const lookUpDef = require('../utils/findProjectDef') 
const {getAllModels, getPrompts, buildTemplateProperties, updateRoutes} =  require('../assets/addRoute/functions')
const path = require('path')
const util = require('util')

const command = {
  name: 'addRoute',
  alias:['addR','addr','ar'],
  description : "Generate a new router",
  run: async toolbox => {
    const {
      parameters,
      print: { error, info},
      filesystem: { cwd, read, exists, separator, write },
      prompts,
      template : {generate}
    } = toolbox

    // Check if current directory is in a kli-cli project
    const project_def = lookUpDef(cwd())

    if (project_def === null) {
      error('No project definition found !')
      error('The addRoute command must be run inside a kli-cli project')
      return undefined;
    }

    // Get the project defintion as json
    const def_content = read(project_def,"json")

    const pattern = /^([-_A-z]+\/)*[-_A-z]+$/g

    function isFilePath(path){
      const is_file_path = pattern.test(path);
      if(!is_file_path){
        error(`${router_name} is not a valid name. Use letters case, slashes, dashes and underscore only.`)
        error(`Example: kc addRoute example/my-router`)
      }
      return is_file_path;
    }

    let router_name = parameters.first;
    // Sanity check
    if(parameters.first){
      if(router_name.length < 3){
        error('The name of the router must be longer than 3 caracters.')
        error('Example: kc addRoute example/my-router')
        return undefined
      }else if (!isFilePath(router_name)) {
        return undefined
      }
    }else{
      do {
        router_name = await prompts.ask("Name of the router ?","example/my-router")
      } while (!isFilePath(router_name));
    }

    // All paths to needed files such as the project routes folder

    const src = path.join(path.dirname(project_def),def_content.backend_path,"src")
    const routes_folder = path.join(src,"routes")
    const models_folder = path.join(src,"models")

    const routes = require(path.join(routes_folder,"routes"))
    const router_file_path = path.join(routes_folder,`${router_name}.js`)
    const router_file = router_name.split(separator).pop()
  
    require('dotenv').config({ path: path.join(path.dirname(project_def),def_content.backend_path,".env") })
    const database = require(path.join(models_folder,"index"));
  
    // Check if router already exist

    if (exists(router_file_path)) {
      error(`A router named ${router_file} already exists !`)
      const overwr = await prompts.confirm('Overwrite ?')
      if (!overwr) {
        return undefined
      }
    }
    
     // Get all models to prompt the user with

    let models = [{
      title: "Aucun",
      value: false
    }]
    models = models.concat(getAllModels(database));

    // Prompt user with different questions to build the router

    const responses = await prompts.any(getPrompts(router_name, models));

     // Build router from template

    const path_to_model = path.relative(router_file_path,models_folder);

    const props = buildTemplateProperties(responses.model, responses.path, path_to_model, database)

    await generate({
      template: `addRoute/${responses.model ? "crud" : "example"}.ejs`,
      target: `${router_file_path}`,
      props: props,
    })

    //  Modify routes.js file

    delete responses.model;

    const {new_routes,update} = updateRoutes(routes,router_name,responses)

    write(path.join(routes_folder,"routes.js"),"module.exports = " + util.inspect(new_routes))

    info(`Router ${update ? "updated" : "created"} : ${router_name}.js`)

  }
}

module.exports = command
