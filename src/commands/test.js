const spawn = require('child_process').spawn
const spawnSync = require('child_process').spawnSync
const command = {
    name: 'test',
    alias:[],
    scope : "in",
    sigint : true,
    description : "Run tests specified in the project",
    run: async toolbox => {
      const {
        project:{
          def_content,
          frontend_path,
          backend_path
        }
      } = toolbox

      const projects = {
        back : null,
        front : null
      }
      if(def_content.projects.hasOwnProperty("backend_path")){
        projects.back = spawn(`npm test`,{ 
          shell:true,
          stdio : 'inherit',
          cwd : backend_path,
          detached : false
        })
      }
      if(def_content.projects.hasOwnProperty("frontend_path")){
        projects.front = spawn(`npm test`,{ 
          shell:true,
          stdio : 'inherit',
          cwd : frontend_path,
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
  