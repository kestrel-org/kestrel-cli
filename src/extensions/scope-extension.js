const path = require('path')
const lookUpDef = require('../utils/findProjectDef') 
module.exports = toolbox => {
    const {
        print :{error},
        filesystem: { cwd }
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

