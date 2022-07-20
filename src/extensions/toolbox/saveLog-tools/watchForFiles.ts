import Project from '@src/types/Project';
import chokidar, { FSWatcher } from 'chokidar';
import toolbox from '../toolbox.js';
/**
 * Used to find new or updated files created by commands that we don't know before running it
 * @returns file watcher
 */
function watcher() : FSWatcher{
    const {
        cli,
        commands,
        path,
        project,
    } = toolbox
   
    const commandFile = commands[cli!.args[0]] || commands[toolbox.aliases[cli!.args[0]]]
    const toWatch = commandFile.foldersToWatch
    let dirs : string[] = []
    const watcher = chokidar.watch(dirs,{
      ignoreInitial:true
    });
    if(toWatch){
      
      for(let folder in toWatch){
        const newRoutes = toWatch[folder as keyof typeof toWatch]!.map((file)=>{
          const projectPath : string = project[`${folder}_path` as keyof Project] as string
          return path.join(projectPath,file)

        })
        
        dirs = [...dirs,...newRoutes]
      }
      watcher.add(dirs)
    }
    return watcher
}
export default watcher
    