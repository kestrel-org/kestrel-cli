module.exports = toolbox => {
    toolbox.loader = null

    const commandPath = toolbox.command.commandPath[0] == "kc" ? "help" : toolbox.command.commandPath[0]
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
      toolbox.prints.error(`${err.name} : ${err.message}`)
      process.exit(0);
    })
}

