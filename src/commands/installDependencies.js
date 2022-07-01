const path = require('path')
const command = {
    name: 'installdependencies',
    alias:['id'],
    scope : "in",
    description : "Install project dependencies",
    run: async toolbox => {
      const {
        project,
        filesystem : {exists},
        prints : {infoLoader,error,warn},
        prompts,
        system : {run}
      } = toolbox

      let directories = {
        backend_path : null,
        frontend_path : null
      }

      for(let dir in directories){
        if(project.def_content.projects.hasOwnProperty(dir)){
          directories[dir] = project[dir]
          if(exists(path.join(directories[dir],"node_modules"))){
            warn(`The directory ${path.basename(directories[dir])} already has dependencies installed !`)
            let overwrite = await prompts.confirm("Overwrite ?");
            if(!overwrite){
              directories[dir] = null
            }
          }
        }
      }
    
      let overwrite = Object.values(directories).every(prop => prop === null);
      if(overwrite){
        return undefined;
      }
      toolbox.nodeModulesCancel = {update : false, path : ""}
      for(let dir in directories){
        if(directories[dir] != null){
          try{
            if(exists(path.join(directories[dir],"node_modules")))
              toolbox.nodeModulesCancel.update = true
            toolbox.nodeModulesCancel.path = directories[dir]
            toolbox.loader = infoLoader(`Installing ${path.basename(directories[dir])} dependencies`)
            
            await run(`npm install`,{ 
              cwd: directories[dir]
            })
            toolbox.loader.succeed()
            toolbox.nodeModulesCancel.update = false
            toolbox.nodeModulesCancel.path = undefined
          }
          catch (err){
            installErrors = true
            if(toolbox.loader != null){
              toolbox.loader.fail()
              toolbox.loader = null
            }
            error(`Error : ${err.stack}`)
          }
        }
      }
    }
  }
  
  module.exports = command
  