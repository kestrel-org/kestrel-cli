
let chalk = null
let ora = null
function getChalk() {
  if (chalk) return chalk

  const Chalk = require('chalk');
  chalk = Chalk;

  return chalk
}
function getOra() {
  if (ora) return ora

  const Ora = require('ora');
  ora = Ora;

  return ora
}

const oras = getOra()
const chalks = getChalk()

function info(message,loader = false){
  if(loader){
    return oras({prefixText:chalks.blue.bold(message)}).start()
  }else{
    return console.log(chalks.blue.bold(message))
  }
}
function error(message){
  console.log(chalks.red.bold(message))
}

module.exports = {
  chalk : chalks,
  info,
  error
}
