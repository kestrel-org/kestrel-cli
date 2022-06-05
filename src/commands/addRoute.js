const {getAllModels, getPrompts, buildTemplateProperties, updateRoutes, getSwaggerTypesProperties,generateSwaggerFile,generateTestFile} =  require('../assets/addRoute/functions')
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
      filesystem: { read, exists, separator, writeAsync, findAsync },
      prompts,
      strings : {upperFirst},
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

    const src = path.join(path.dirname(project_def),def_content.projects.backend_path,"src/")
    const routes_folder = path.join(src,"routes")
    const models_folder = path.join(src,"models")

    const routes = await import(url.pathToFileURL(path.join(routes_folder,"routes.js")))
    const router_file_path = path.join(routes_folder,`${router_name}.js`)
    const router_file = router_name.split(separator).pop()

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

    const responses = await prompts.any(getPrompts(toolbox, backend_path, router_name, models));

    // Build router from template

    const path_to_model = path.relative(path.dirname(router_file_path),models_folder).replace(/\\/g,"/");    
    const path_to_app = path.relative(path.dirname(router_file_path),src).replace(/\\/g,"/");

    const props = buildTemplateProperties(responses.model, database.default, responses.path, path_to_model, path_to_app)


    // Generate test file for the backend
    if(responses.createTest && (responses.testOverwrite===undefined || responses.testOverwrite)){
      const test_file = path.join(tests_path,`${router_name}.spec.js`)
      await generateTestFile(toolbox,props,test_file)
    }

    toolbox.loader = info(chalk.blue.bold('Generating router file'),true)
    await generate({
      template: `addRoute/${responses.model ? "crud" : "example"}.ejs`,
      target: `${router_file_path}`,
      props: props,
    })
    toolbox.loader.succeed()

    // Generate swagger model definition
     
    if(responses.model){
      const swag_file = path.join(src,"routes/swaggerModels",upperFirst(responses.model)+".js")
      await generateSwaggerFile(toolbox,props,swag_file)
    }
  
    // TODO : refactor this shitty code
    
    // If frontend is available run the following code

    if(def_content.projects.frontend_path){

      const create_service = await prompts.confirm(`Create the associated service ?`)
      if(create_service){

        // Define all paths for the files needed to create the service 

        const front_src = path.join(path.dirname(project_def),def_content.projects.frontend_path,"src")
        const services_path = path.join(front_src,"app/services")
        const service_name = path.basename(router_file)
        const service_path = path.join(services_path,service_name,service_name)

        // Check if a service file does not already exist

        let owf = true
        const service_found = await findAsync(services_path,{matching : [`${service_name}.service.ts`,`${service_name}.service.spec.ts`]})
        if(service_found.length > 0){
          error(`A service named ${service_name} already exists !`)
          const overwrite_service = await prompts.confirm(`Overwrite ?`)
          if(!overwrite_service)
            owf = false
        }
        if(owf){

          // Generate the properties to render the file from the template

          toolbox.loader = info(chalk.blue.bold('Generating service file'),true)
          const properties_to_remove = [props.model_id,"createdAt","updatedAt"]

          props.model_name = upperFirst(responses.model)
          props.service_name = upperFirst(service_name)+"Service"
          props.service_file_name = path.basename(`${service_path}.service.ts`).replace('.ts','')
          props.model_properties_post = props.model_properties.filter(property => !properties_to_remove.includes(property.fieldName));
          props.path_to_env = path.relative(path.dirname(`${service_path}.service.ts`),path.join(front_src,"environments/environment")).replace(/\\/g,"/")
          props.model_id_type = ["integer"].includes(props.model_id_type) ? "number" : props.model_id_type

          const service_files = ["service","service.spec"];
          let generators = []

          // Generate the service files

          generators = service_files.reduce((res, file) => {
            const generator = generate({
              template: `addRoute/service/${responses.model ? "crud" : "example"}.${file}.ejs`,
              target: `${service_path}.${file}.ts`,
              props: props,
            }).catch((err)=>{error(err);return undefined})
            return res.concat(generator)
          }, generators)
          await Promise.all(generators)
          toolbox.loader.succeed()
        }
      }
    }
    
    //  Modify routes.js file

    delete responses.model;

    const {new_routes,update} = updateRoutes(routes.default,router_name,responses)

    toolbox.loader = info(chalk.blue.bold('Adding router to the routes'),true)
    await writeAsync(path.join(routes_folder,"routes.js"),"export default " + util.inspect(new_routes))
    toolbox.loader.succeed()
    
    info(chalk.blue.bold(`Router ${update ? "updated" : "created"} : `) + chalk.white.bold(`${router_name}.js`));
    
    
    
  }
}

module.exports = command
