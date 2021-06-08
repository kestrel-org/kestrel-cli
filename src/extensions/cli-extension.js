const prompt = require('../toolbox/prompts/prompts-convert')
const logColors  = require('../toolbox/chalk/chalk-convert')

module.exports = toolbox => {
  toolbox.cHelp = () => {
    toolbox.print.info('called cHelp extension')
  }
  toolbox.prompts = prompt;
  toolbox.logColors = logColors;
}
