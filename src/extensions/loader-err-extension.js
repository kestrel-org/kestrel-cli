module.exports = toolbox => {
    toolbox.loader = null
    process.on('SIGINT', function() {
        if(toolbox.loader != null){
          toolbox.loader.fail()
        }
        process.exit(0);
    });
    process.on("uncaughtException",(err)=>{
      if(toolbox.loader != null){
        toolbox.loader.fail()
        toolbox.loader = null
      }
      toolbox.logColors.error(`${err.name} : ${err.message}`)
      process.emit('SIGINT')
    })
}

