const prompt = require('./override/prompt')
const print  = require('./override/print')
const path = require('path')
const saveFiles = require('./saveFileUpdates/save')
const checkUpdate = require("./utils/checkForUpdate")
require("./override/string")

module.exports = async toolbox => {  
  
  toolbox.prompts = prompt;
  toolbox.prints = print;
  toolbox.path = path;
  await checkUpdate(toolbox)
  toolbox.template.saveLog = saveFiles(toolbox)
}
