
let chalk = null
function getChalk() {
  if (chalk) return chalk

  const Chalk = require('chalk');
  chalk = Chalk;

  return chalk
}
const logColors = getChalk

module.exports = logColors
