const prompt = require('./override/prompt')
const print  = require('./override/print')
const path = require('path')

module.exports = toolbox => {
  toolbox.prompts = prompt;
  toolbox.prints = print;
  toolbox.path = path;
  toolbox.cHelp = () => {
    toolbox.logColors.info('called cHelp extension')
  }
  
}
