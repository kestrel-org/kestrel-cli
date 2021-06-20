const command = {
  name: 'database',
  alias:['db'],
  scope : "in",
  description : "Generate commands based on sequelize instructions",
  run: async toolbox => {
    const { printHelp } = toolbox.print
    printHelp(toolbox)
  }
}

module.exports = command
