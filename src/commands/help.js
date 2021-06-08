const command = {
  name: 'help',
  alias:['h'],
  dashed : true,
  hidden : true,
  description : "Display a list of available commands.",
  run: async toolbox => {
    const { printHelp } = toolbox.print
    printHelp(toolbox)
  }
}

module.exports = command
