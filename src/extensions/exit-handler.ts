import {Command} from 'commander';
import { Toolbox } from "./toolbox/toolbox";

/**
 * Handle exit operations
 *
 * @param {Toolbox} toolbox The cli toolbox
 * @param {Command} command The command file that is being run
*/
async function exitHandler(toolbox : Toolbox,command : Command){

    const {
      print : {
          chalk,
          log,
          error
      }
    } = toolbox

    process.on('SIGINT', async () => {
      if(toolbox.loader){
          await toolbox.loader.fail()
      }
      process.exit(0);
    });
    process.on('exit',(code)=>{
      if(toolbox.fileSystemUpdates){
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
      if(toolbox.loader){
        await toolbox.loader.fail()
      }
      error(`Kestrel-cli - ${err.stack}`)
      process.exit(0);
    })
    
}
export default exitHandler

