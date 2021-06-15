const path = require('path')
const command = {
    name: 'installDependencies',
    alias:['insd'],
    scope : "in",
    description : "Install project dependencies",
    run: async toolbox => {
      const {
        project_def,
        filesystem : {read, exists},
        logColors : {info,error},
        prompts,
        system
      } = toolbox

      // Get the project defintion as json
      const def_content = read(project_def,"json")
      const root_dir = path.dirname(project_def)

      let installs = [];
      let directories = {
        backend_path : null,
        frontend_path : null
      }

      for(let dir in directories){
        if(def_content.projects[dir]){
          directories[dir] = path.join(root_dir,def_content.projects[dir])
          if(exists(path.join(directories[dir],"node_modules"))){
            error(`The directory ${path.basename(directories[dir])} already has dependencies installed !`)
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

      for(let dir in directories){
        if(directories[dir] != null){
          installs.push(
              system.spawn(`cd ${directories[dir]} && npm install --silent`, {
                shell: true,
                stdio: 'inherit',
              })
          )
        }
      }
      
      await Promise.all(installs);
      info(`Dependencies installed`)
    }
  }
  
  module.exports = command
  