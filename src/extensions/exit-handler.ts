import {Command} from 'commander';
import { Loader } from './toolbox/loader-tools/worker.js';
import { Toolbox } from "./toolbox/toolbox.js";

/**
 * Handle exit operations
 * @param toolbox The cli toolbox
 * @param command The command file that is being run
*/
async function exitHandler(toolbox : Toolbox,command : Command){

    const {
      print : {
          chalk,
          log,
          error
      }
    } = toolbox
    const kcCommand = toolbox.commands[command.name()]
    if(!kcCommand.sigint){
      process.on('SIGINT', async () => {
        if(toolbox.loader instanceof Loader){
            await toolbox.loader.fail()
        }
        process.exit(0);
      });
    }
    
    process.on('exit',(code)=>{
      if(toolbox.fileSystemUpdates.length>0){
        log('')
        for(let elem of toolbox.fileSystemUpdates){
          switch(elem.action){
            case "CREATE" : {
              log(`${chalk.green(elem.action)} ${elem.path} (${elem.size} bytes)`)
            }
            break;
            case "UPDATE" : {
              log(`${chalk.blue(elem.action)} ${elem.path} (${elem.size} bytes)`)
            }
            break;
          }
        }
        log('')
      }
    })
    process.on("uncaughtException",async (err)=>{
      if(toolbox.loader instanceof Loader){
        await toolbox.loader.fail()
      }
      toolbox.exit(command,`${err.stack}`)
    })
    
}
export default exitHandler

