const compare = require('compare-versions').compare;
async function checkUpdate(toolbox){
    const {
        system : {run},
        meta : {version},
        prints : {log,chalk}
    } = toolbox
  const remoteVersion = await run("npm view kli-cli version",{trim : true})
  const currentVersion = await version()
  if(compare(remoteVersion, currentVersion, '>')){
    log(`${chalk.yellow("New update available :")} ${chalk.white.bold(remoteVersion)}`)
  }
}

module.exports = checkUpdate