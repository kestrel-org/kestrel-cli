import jetpack from 'fs-jetpack';

/**
 * Is this a file?
 *
 * @param path The filename to check.
 * @returns `true` if the file exists and is a file, otherwise `false`.
*/
function isFile(path: string): boolean {
    return jetpack.exists(path) === 'file'
}

/**
 * Is this a directory?
 *
 * @param path The filename to check.
 * @returns `true` if the directory exists and is a directory, otherwise `false`.
*/
function isDirectory(path: string): boolean {
    return jetpack.exists(path) === 'dir'
}

/**
 * Is this a directory?
 *
 * @param path The filename to write to
 * @param content The content of the file
 * @param options Node filesystem options
*/
function write(path: string,content : any,options? : any) {
    jetpack.write(path,content,options)
}
  


const FileSystem  = {
    ...jetpack,
    isFile,
    isDirectory,
    write
}

export default FileSystem