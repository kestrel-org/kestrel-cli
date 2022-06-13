const {
  sequelizeUtils : {getAllModels},
  getPrompts,
  buildTemplateProperties,
  updateRoutes,
  generateUtils : {generateSwaggerFile,generateTestFile,generateRouterFile,generateServiceFiles}
} =  require('../assets/addRoute/functions')

const util = require('util')
const url = require('url')

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
      strings : {upperFirst},
      path,
      project_def
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

    const src = path.join(path.dirname(project_def),def_content.projects.backend_path,"src/")
    const routes_folder = path.join(src,"routes")
    const models_folder = path.join(src,"models")

    const routes = await import(url.pathToFileURL(path.join(routes_folder,"routes.js")))
    const router_file_path = path.join(routes_folder,`${router_name}.js`)
    const router_file = router_name.split(separator).pop()

    // Front paths
    const service_name = path.basename(router_file)
    const front_src = path.join(path.dirname(project_def),def_content.projects.frontend_path || "","src")
    const services_path = path.join(front_src,"app/services")
    const service_path = path.join(services_path,service_name,service_name)

    const root_dir = path.dirname(project_def)
    const backend_path = path.join(root_dir,def_content.projects.backend_path)
    const tests_path = path.join(backend_path,"tests")
  
    require('dotenv').config({ path: path.join(path.dirname(project_def),def_content.projects.backend_path,".env") })
    const database = await import(url.pathToFileURL(path.join(models_folder,"index.js")))
   
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
    models = models.concat(getAllModels(database.default));

    // Prompt user with different questions to build the router

    const questionsPaths = {
      src,
      backend_path,
      service_name,
      services_path,
      service_path
    }

    const responses = await prompts.any(getPrompts(toolbox, def_content, router_name, models, questionsPaths));

    // Build router from template

    const path_to_model = path.relative(path.dirname(router_file_path),models_folder).replace(/\\/g,"/");    
    const path_to_app = path.relative(path.dirname(router_file_path),src).replace(/\\/g,"/");

    const props = buildTemplateProperties(responses.model, database.default, responses.path, path_to_model, path_to_app)


    // Generate test file for the backend
    if(responses.createTest && (responses.testOverwrite===undefined || responses.testOverwrite)){
      const test_file = path.join(tests_path,`${router_name}.spec.js`)
      await generateTestFile(toolbox,props,test_file)
    }

    await generateRouterFile(toolbox,props,responses.model,router_file_path)

    // Generate swagger model definition
     
    if(responses.model){
      const swag_file = path.join(src,"routes/swaggerModels",upperFirst(responses.model)+".js")
      await generateSwaggerFile(toolbox,props,swag_file)
      
    }
  
    // If frontend available run code
    
    if(responses.createService && (responses.serviceOverwrite===undefined || responses.serviceOverwrite)){

      // Define all paths for the files needed to create the service 

      const frontPaths = {
        front_src,
        service_path,
        service_name
      }

      await generateServiceFiles(toolbox,props,responses.model,frontPaths)
    }
    
    //  Modify routes.js file

    const {new_routes,update} = updateRoutes(routes.default,router_name,Object.fromEntries(Object.entries(responses).slice(0,3)))

    toolbox.loader = info(chalk.blue.bold('Adding router to the routes'),true)
    await writeAsync(path.join(routes_folder,"routes.js"),"export default " + util.inspect(new_routes))
    toolbox.loader.succeed()
    
    info(chalk.blue.bold(`Router ${update ? "updated" : "created"} : `) + chalk.white.bold(`${router_name}.js`));
    
  }
}

module.exports = command
