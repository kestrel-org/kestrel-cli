const spawn = require('child_process').spawn
const spawnSync = require('child_process').spawnSync
const command = {
    name: 'start',
    alias:[],
    scope : "in",
    sigint : true,
    description : "Run the backend and the frontend",
    run: async toolbox => {
      const {
        filesystem : {read},
        path,
        project_def,
      } = toolbox

      const def_content = read(project_def,"json")
      const root_dir = path.dirname(project_def)
      const projects = {
        back : null,
        front : null
      }
      if(def_content.projects.hasOwnProperty("backend_path")){
        projects.back = spawn(`npm start`,{ 
          shell:true,
          stdio : 'inherit',
          cwd : path.join(root_dir,def_content.projects.backend_path),
          detached : true
        })
      }
      if(def_content.projects.hasOwnProperty("frontend_path")){
        projects.front = spawn(`npm start`,{ 
          shell:true,
          stdio : 'inherit',
          cwd : path.join(root_dir,def_content.projects.frontend_path),
          detached : true
        })
      }
      process.on('SIGINT', async () => {
        for(let project in projects){
          if(projects[project]){
            if(process.platform === "win32"){
              spawnSync("taskkill", ["/pid", projects[project].pid, '/f', '/t']);
            }else{
              projects[project].kill()
            }
          }
        }
      })
    }
  }
  
  module.exports = command
  