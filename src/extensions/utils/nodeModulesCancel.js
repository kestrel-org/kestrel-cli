const path = require("path")
module.exports = async (toolbox,cancelObj) =>{
    const {
        filesystem: { removeAsync }
    } = toolbox
    if(!cancelObj.update){
        await removeAsync(path.join(cancelObj.path,"node_modules"))
    }
}