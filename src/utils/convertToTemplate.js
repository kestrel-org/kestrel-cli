const back_files = require('../assets/back_files');
const front_files = require('../assets/front_files')
const main_files = require('../assets/main_files')

const {
  filesystem
} = require('gluegun');
const fs = require('fs');
const path = require('path')


async function modifyFile(file, replace) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname,'/../templates/',file.path,file.filename), 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      let pattern = new RegExp(replace.this, "g");
      data = data.replace(pattern, replace.by);
      fs.writeFile(path.join(__dirname,'/../templates/',file.path,file.filename), data, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });
}

async function convert() {
  const f2convert = [
    back_files.toTransform,
    front_files.toTransform,
    main_files.toTransform
  ];
  for (let files of f2convert) {
    for (let file of files) {
      if(file.convert){
        if(file.replace){
          for (let replace of file.replace) {
            await modifyFile(file, replace);
          }
        }
        filesystem.rename(path.join(__dirname,'/../templates/',file.path,file.filename), `${file.filename}.ejs`);
      }
    }
  }

}
convert();