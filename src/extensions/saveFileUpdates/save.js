const SaveFiles = require("./saveFiles")
const renameDbFiles = require('../../assets/database/renameToCjs')

class Save extends SaveFiles{
  constructor(toolbox){
    super(toolbox)
  }
  async generate(options){
    return await this.toolbox.template.generate(options)
  }
  async copy({from,target,options}){
    await this.toolbox.filesystem.copyAsync(from,target,options)
  }
  async patch(options){
    await this.toolbox.patching.patch(options)
  }
  async write({target,content}){
    await this.toolbox.filesystem.writeAsync(target,content)
  }
  async run(command,{target=null,action=null,...options}){
    const isDbCommand = this.isDbCommand()
    const output = await this.toolbox.system.run(command,options)
    if(isDbCommand){
      await renameDbFiles(this.toolbox)
    }
    return output
  }
}

module.exports = toolbox => {
  return new Save(toolbox)
}
