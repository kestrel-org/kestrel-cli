
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

  const Ora = require('../loader/worker')
  ora = Ora;

  return ora
}

const oras = getOra()
const chalks = getChalk()
function info(message){
  return console.log(chalks.blue.bold(message))
}

function infoLoader(message,loaderOptions = {}){
  loaderOptions = {prefixText:chalks.blue.bold(`${message} `),...loaderOptions}
  const loader = new oras(loaderOptions)
  loader.start()
  return loader
}
function error(message){
  console.log(chalks.red.bold(message))
}
function warn(message){
  console.log(chalks.yellow.bold(message))
}
function log(message){
    console.log(message)
}

module.exports = {
  chalk : chalks,
  info,
  infoLoader,
  log,
  error,
  warn
}
