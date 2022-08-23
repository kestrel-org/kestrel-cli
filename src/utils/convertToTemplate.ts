import back_files from '@src/assets/back_files.js'
import front_files from '@src/assets/front_files.js'
import main_files from '@src/assets/main_files.js'
import toolbox from '@src/toolbox/toolbox.js'
import fs from 'node:fs'
import url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const { fileSystem, path } = toolbox

/**
 * Modify a file string
 * @param file file to read
 * @param replace object used to replace string by another
 */
async function modifyFile(file: any, replace: any) {
  return new Promise<void>((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, '/../templates/', file.path, file.filename),
      'utf8',
      function (err, data) {
        if (err) {
          reject(err)
        }
        let pattern = new RegExp(replace.this, 'g')
        data = data.replace(pattern, replace.by)
        fs.writeFile(
          path.join(__dirname, '/../templates/', file.path, file.filename),
          data,
          function (err) {
            if (err) {
              reject(err)
            }
            resolve()
          }
        )
      }
    )
  })
}

/**
 * Convert Kestrel Template files to templates usable by kestre-cli
 */
async function convert() {
  const f2convert = [
    back_files.toTransform,
    front_files.toTransform,
    main_files.toTransform,
  ]
  for (let files of f2convert) {
    for (let file of files) {
      if (file.convert) {
        if (file.replace) {
          for (let replace of file.replace) {
            await modifyFile(file, replace)
          }
        }
        fileSystem.rename(
          path.join(__dirname, '/../templates/', file.path, file.filename),
          `${file.filename}.ejs`
        )
      }
    }
  }
}
convert()
