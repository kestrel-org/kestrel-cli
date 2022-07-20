import { FsAction } from "@src/types/toolbox/saveLog/FsAction";
import toolbox from "../toolbox.js";
import getTotalSize from "./findPathSize.js";
/**
 * Update toolbox.fileSystemUpdates with new or updated files
 * @param filePath path to file
 * @param action string - created or updated
 * @param isDb check for database command because renaming files is needed
 */
function updateFileSystem(filePath : string,action : FsAction,isDb : boolean = false){

    const {
        project : {
            project_def
        },
        fileSystem,
        path
    } = toolbox

    let readablePath = filePath
    if(project_def){
        let foundRoot = false
        const projectRoot = toolbox.path.basename(toolbox.path.dirname(project_def))
        const reducePath = filePath.split(fileSystem.separator).reduce(
            (readableArray : string[], currentValue) => {
                if(currentValue==projectRoot)
                    foundRoot=true
                if(foundRoot)
                    readableArray.push(currentValue)
                return readableArray
            },
            []
        );
        readablePath = path.join(...reducePath)
    }

    const size = getTotalSize(filePath)

    if(isDb)
        readablePath = readablePath.replace(".js",".cjs")
    
    const systemUpdate = {action : action,path : readablePath, size : size}

    !Array.isArray(toolbox.fileSystemUpdates) ? toolbox.fileSystemUpdates = [systemUpdate] : toolbox.fileSystemUpdates.push(systemUpdate)
}
export default updateFileSystem