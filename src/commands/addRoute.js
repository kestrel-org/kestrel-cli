const {getAllModels, getPrompts, buildTemplateProperties, updateRoutes} =  require('../assets/addRoute/functions')
const util = require('util')

const command = {
  name: 'addRoute',
  alias:['addr'],
  scope : "in",
  needs : ["backend"],
  description : "Generate a new router",
  run: async toolbox => {
    const {
      parameters,
      prints : {info,error,chalk,log},
      filesystem: { read, exists, separator, writeAsync },
      prompts,
      path,
      project_def,
      template : {generate}
    } = toolbox
  
    // Get the project defintion as json
    const def_content = read(project_def,"json")

    const pattern = /^([-_A-z]+\/)*[-_A-z]{3,}$/g

    function isFilePath(path){
      let is_file_path = pattern.test(path);
      if(!is_file_path){
        error(`${router_name} is not a valid name. Use letters case, slashes, dashes and underscore only.`)
        error("The name should also be more than 3 caracters long.")
        error(`Example: kc addRoute example/my-router`)
      }
      return is_file_path;
    }

    let router_name = parameters.first;
    // Sanity check
    if(router_name){
      if(!isFilePath(router_name)){
        return undefined
      }
    }else{
      do {
        router_name = await prompts.ask("Name of the router ?",null,"example/my-router")
      } while (!isFilePath(router_name));
    }
    
    // All paths to needed files such as the project routes folder

    const src = path.join(path.dirname(project_def),def_content.projects.backend_path,"src")
    const routes_folder = path.join(src,"routes")
    const models_folder = path.join(src,"models")

    const routes = require(path.join(routes_folder,"routes"))
    const router_file_path = path.join(routes_folder,`${router_name}.js`)
    const router_file = router_name.split(separator).pop()
  
    require('dotenv').config({ path: path.join(path.dirname(project_def),def_content.projects.backend_path,".env") })
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
      title: "None",
      value: false
    }]
    models = models.concat(getAllModels(database));

    // Prompt user with different questions to build the router

    const responses = await prompts.any(getPrompts(router_name, models));

    // Build router from template

    const path_to_model = path.relative(path.dirname(router_file_path),models_folder).replace(/\\/g,"/");

    const props = buildTemplateProperties(responses.model, responses.path, path_to_model, database)
    toolbox.loader = info(chalk.blue.bold('Generating router file'),true)
    await generate({
      template: `addRoute/${responses.model ? "crud" : "example"}.ejs`,
      target: `${router_file_path}`,
      props: props,
    })
    toolbox.loader.succeed()

    //  Modify routes.js file

    delete responses.model;

    const {new_routes,update} = updateRoutes(routes,router_name,responses)

    toolbox.loader = info(chalk.blue.bold('Adding router to the routes'),true)
    await writeAsync(path.join(routes_folder,"routes.js"),"module.exports = " + util.inspect(new_routes))
    toolbox.loader.succeed()
    
    info(chalk.blue.bold(`Router ${update ? "updated" : "created"} : `) + chalk.white.bold(`${router_name}.js`));
    
    
    
  }
}

module.exports = command
