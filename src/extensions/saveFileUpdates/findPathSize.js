const fs = require("fs")
const path = require("path")

const getAllFiles = function(Path, arrayOfFiles) {
    if(!fs.statSync(Path).isDirectory())
        return [Path]
    files = fs.readdirSync(Path)
    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(path.join(Path,file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(Path,file), arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(Path,file))
        }
    })
    return arrayOfFiles
}

const getTotalSize = function(directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath)

    let totalSize = 0

    arrayOfFiles.forEach(function(filePath) {
        totalSize += fs.statSync(filePath).size
    })

    return totalSize
}

module.exports = getTotalSize