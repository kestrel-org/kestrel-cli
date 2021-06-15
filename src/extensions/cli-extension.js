const prompt = require('../toolbox/prompts/prompts-convert')
const logColors  = require('../toolbox/chalk/chalk-convert')

module.exports = toolbox => {
  toolbox.prompts = prompt;
  toolbox.logColors = logColors;
  toolbox.cHelp = () => {
    toolbox.logColors.info('called cHelp extension')
  }
  
}
