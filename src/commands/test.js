const command = {
    name: 'test',
    alias:[],
    scope : "in",
    description : "Build project for production",
    run: async toolbox => {
      const { printHelp } = toolbox.print
      printHelp(toolbox)
    }
  }
  
  module.exports = command
  