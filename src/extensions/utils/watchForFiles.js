const chokidar = require('chokidar');
function watcher(toolbox){
    const {
        path,
        project,
    } = toolbox

    const commandPath = toolbox.command.commandPath[0]
    const commandFile = require(path.join('../../commands',commandPath))
    const toWatch = commandFile.foldersToWatch

    let dirs = []
    const watcher = chokidar.watch(dirs,{
      ignoreInitial:true
    });
    if(toWatch){
      for(let folder in toWatch){
        const newRoutes = toWatch[folder].map((file)=>{
          return path.join(project[`${folder}_path`],file)
        })
        dirs = [...dirs,...newRoutes]
      }
      watcher.add(dirs)
    }
    return watcher
}
module.exports = watcher
    