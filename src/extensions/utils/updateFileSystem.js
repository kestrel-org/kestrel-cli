const getTotalSize = require('./findPathSize')
function updateFileSystem(toolbox,filePath,action,isDb = false){

    const {
        project : {
            project_def
        },
        filesystem,
        path
    } = toolbox

    let readablePath = filePath
    if(project_def){
        let foundRoot = false
        const projectRoot = toolbox.path.basename(toolbox.path.dirname(project_def))
        const reducePath = filePath.split(filesystem.separator).reduce(
            (readableArray, currentValue) => {
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

    !Array.isArray(toolbox.filesystemUpdates) ? toolbox.filesystemUpdates = [systemUpdate] : toolbox.filesystemUpdates.push(systemUpdate)
}
module.exports = updateFileSystem