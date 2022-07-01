const cancelNode = require('./utils/nodeModulesCancel')
module.exports = toolbox => {

    const {
      command,
      path,
      prints : {
        chalk,
        log,
        error
      }
    } = toolbox
    
    toolbox.loader = null

    const commandPath = command.commandPath[0] == "kc" ? "help" : command.commandPath[0]
    const command_name = command.name
    if(command_name!="version"){
      const command =require(path.join('../commands',commandPath))
      if(!command.sigint){
        process.on('SIGINT', async () => {
          if(toolbox.loader != null){
            toolbox.loader.fail()
          }
          if(toolbox.hasOwnProperty("nodeModulesCancel")){
            await cancelNode(toolbox,toolbox.nodeModulesCancel)
          }
          process.exit(0);
        });
      }
      process.on('exit',(code)=>{
        if(toolbox.hasOwnProperty("filesystemUpdates")){
          log('')
          for(elem of toolbox.filesystemUpdates){
            switch(elem.action){
              case "CREATE" : {
                log(`${chalk.green(elem.action)} ${elem.path} (${elem.size} bytes)`)
              }
              break;
              case "UPDATE" : {
                log(`${chalk.blue(elem.action)} ${elem.path} (${elem.size} bytes)`)
              }
              break;
            }
          }
          log('')
        }
      })
      process.on("uncaughtException",async (err)=>{
        if(toolbox.loader != null){
          toolbox.loader.fail()
          toolbox.loader = null
        }
        error(`Error : ${err.stack}`)
        process.exit(0);
      })
    }
}

