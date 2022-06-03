module.exports = toolbox => {
    toolbox.loader = null

    const commandPath = toolbox.command.commandPath[0] == "kc" ? "help" : toolbox.command.commandPath[0]
    const command_name = toolbox.command.name
    if(command_name!="version"){
      const command =require(toolbox.path.join('../commands',commandPath))
      if(!command.sigint){
        process.on('SIGINT', function() {
          if(toolbox.loader != null){
            toolbox.loader.fail()
          }
          process.exit(0);
        });
      }
      process.on("uncaughtException",(err)=>{
        if(toolbox.loader != null){
          toolbox.loader.fail()
          toolbox.loader = null
        }
        toolbox.prints.error(`Error : ${err.stack}`)
        process.exit(0);
      })
    }
}

