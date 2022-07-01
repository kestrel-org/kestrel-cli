const prompt = require('./override/prompt')
const print  = require('./override/print')
const path = require('path')
const generate = require('./override/generate')
require("./override/string")

module.exports = toolbox => {  
  toolbox.prompts = prompt;
  toolbox.prints = print;
  toolbox.path = path;
  toolbox.template.saveLog = generate(toolbox)
}
