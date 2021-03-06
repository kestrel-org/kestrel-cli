const path = require('path')
const lookUpDef = require('./utils/findProjectDef') 
module.exports = toolbox => {
    const {
        prints : {error},
        filesystem: { cwd, exists, read },
    } = toolbox

    const commandPath = toolbox.command.commandPath[0] == "kc" ? "help" : toolbox.command.commandPath[0]
    const command_name = toolbox.command.name
    if(command_name!="version"){
        const command = require(path.join('../commands',commandPath))

        // Check if current directory is in a kestrel-cli project

        const project_def = lookUpDef(cwd())
        toolbox.project = {}
        toolbox.project.project_def = project_def;

        if(command.scope == "in"){
            if (project_def === null) {
                error('No project definition found !')
                error(`The '${command_name}' command must be run inside a kestrel-cli project`)
                return process.exit(0);
            }
            
            // Get the project defintion as json
            const def_content = read(project_def,"json")
            const root_dir = path.dirname(project_def)
            toolbox.project.def_content = def_content
            
            if(command.needs && command.needs.length<=2){
                for(let need of command.needs){
                    if(!def_content.projects.hasOwnProperty(`${need}_path`)){
                        error(`Missing a ${need} project !`)
                        return process.exit(0);
                    }
                }
            }
            
            if(def_content.projects.hasOwnProperty('backend_path')){
                if(!exists(path.join(root_dir,def_content.projects.backend_path))){
                    error(`Cannot find directory '${def_content.projects.backend_path}', did you change its name, if so update it in the kestrel-cli.json file`)
                    return process.exit(0);
                }
                const backend_path = path.join(root_dir,def_content.projects.backend_path)
                toolbox.project.backend_path = backend_path
            }

            if(def_content.projects.hasOwnProperty('frontend_path')){
                if(!exists(path.join(root_dir,def_content.projects.frontend_path))){
                    error(`Cannot find directory '${def_content.projects.frontend_path}', did you change its name, if so update it in the kestrel-cli.json file`)
                    return process.exit(0);
                }
                const frontend_path = path.join(root_dir,def_content.projects.frontend_path)
                toolbox.project.frontend_path = frontend_path
            }

            
        }
        if(command.scope == "out"){
            if (project_def != null) {
                error('Project definition found !')
                error(`The '${command_name}' command must be run outside a kestrel-cli project`)
                return process.exit(0);
            }
        }
    }
    
}

