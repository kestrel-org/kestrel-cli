const path = require('path')
const lookUpDef = require('../utils/findProjectDef') 
module.exports = toolbox => {
    const {
        logColors : {error},
        filesystem: { cwd, exists, read },
    } = toolbox

    const commandPath = toolbox.command.commandPath[0] == "kc" ? "help" : toolbox.command.commandPath[0]
    const command_name = toolbox.command.name
    const command =require(path.join('../commands',commandPath))

    // Check if current directory is in a kli-cli project

    const project_def = lookUpDef(cwd())

    if(command.scope == "in"){
        if (project_def === null) {
            error('No project definition found !')
            error(`The '${command_name}' command must be run inside a kli-cli project`)
            return process.exit(0);
        }
        // Get the project defintion as json
        const def_content = read(project_def,"json")
        const root_dir = path.dirname(project_def)
        if(def_content.backend_path){
            if(!exists(path.join(root_dir,def_content.backend_path))){
                error(`Cannot find directory ' ${def_content.backend_path} ', did you change its name, if so update in the kli-cli.json file`)
                return process.exit(0);
            }
        }
        if(def_content.frontend_path){
            if(!exists(path.join(root_dir,def_content.frontend_path))){
                error(`Cannot find directory ' ${def_content.frontend_path} ', did you change its name, if so update in the kli-cli.json file`)
                return process.exit(0);
            }
        }
    }
    if(command.scope == "out"){
        if (project_def != null) {
            error('Project definition found !')
            error(`The '${command_name}' command must be run outside a kli-cli project`)
            return process.exit(0);
        }
    }
    toolbox.project_def = project_def;
    
}

