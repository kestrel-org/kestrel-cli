const back_files = require('../assets/back_files')
const front_files = require('../assets/front_files')
const main_files = require('../assets/main_files')
const simpleGit = require('simple-git');
simpleGit().clean(simpleGit.CleanOptions.FORCE);

const command = {
  name: 'new',
  alias: ['n'],
  scope: "out",
  description: "Create new project",
  run: async toolbox => {
    const {
      parameters,
      prints: { infoLoader, error,  warn },
      strings: { kebabCase },
      filesystem: { exists, removeAsync, cwd },
      prompts,
      path,
      meta: { version },
      system: { run , spawn},
      template: {saveLog},
    } = toolbox

    //  set up initial props (to pass into templates)
    const options = parameters.options
    let back = Boolean(options.back) || Boolean(options.b)
    let front = Boolean(options.front) || Boolean(options.f)
    let single = Boolean(back ? !front : front)


    const props = {
      name: parameters.first,
      backend_path: "backend",
      frontend_path: "frontend",
      kc_version: version()
    }

    let toCreate = ""
    let templateFiles = [back_files, front_files, main_files]
    if (single) {
      if (front) {
        toCreate = "frontend"
        templateFiles = [front_files, main_files]
        props['fname'] = props.name
        props.frontend_path = ""
        props.backend_path = null
      }
      if (back) {
        toCreate = "backend"
        templateFiles = [back_files, main_files]
        props['bname'] = props.name
        props.frontend_path = null
        props.backend_path = ""
      }
    }


    if (!props.name || props.name.length === 0) {
      error('You must provide a valid project name.')
      error('Example: kc new my-project')
      return undefined
    } else if (!/^[a-z0-9-_]+$/.test(props.name)) {
      const validName = kebabCase(props.name)
      error(`${props.name} is not a valid name. Use lower case, dashes and underscore only.`)
      error(`Suggested: kc new ${validName}`)
      return undefined
    }

    if (exists(props.name)) {
      warn(`A directory named ${props.name} already exists !`)
      const overwrite = await prompts.confirm('Overwrite ?')
      if (!overwrite) {
        return undefined
      }
      toolbox.loader = infoLoader('Removing directory')
      await removeAsync(props.name)
      await toolbox.loader.succeed()
    }

    // get NGX-TEMPLATE from github repository
    const downloadTemplate = () => {
      return new Promise(async (resolve, reject) => {
        try {
          if (exists(__dirname + "/../templates/angular-node")) {
            if (process.platform == "win32") {
              await run("rmdir /s /q \"" + __dirname + "/../templates/angular-node\"")
            } else {
              await run("rm -rf " + __dirname + "/../templates/angular-node")
            }
          }

          await simpleGit().clone('https://github.com/kestrel-org/kestrel.git',`${__dirname}/../templates/angular-node`)
          await run("node " + __dirname + "/../utils/convertToTemplate.js")
          resolve(true)
        } catch (err) {
          await toolbox.loader.fail()
          error(`The download of the github repository has failed.`)
          resolve(false)
        }
      });
    }

    toolbox.loader = infoLoader('Downloading template')
    
    const isDownloaded = await downloadTemplate()
    if (!isDownloaded) 
      process.exit(0)
    
    await toolbox.loader.succeed()
    toolbox.loader = infoLoader('Copying directory')
    await saveLog.copy({
      from : __dirname + '/../templates/angular-node/' + toCreate, 
      target : props.name, 
      options : {
        overwrite: true,
        matching: [
          './!(.github|.git|ROADMAP.md|CHANGELOG.md|.mergify.yml|README.md|*.ejs)',
          './!(.github|.git)/**/!(*.ejs)'
        ]
      }
    })
    await toolbox.loader.succeed()

    let generators = []
    toolbox.loader = infoLoader('Generating templates')
    for (let files of templateFiles) {
      generators = files.toTransform.reduce((res, file) => {
        const generator = saveLog.generate({
          template: `${file.path + file.filename}.ejs`,
          target: `${props.name}/${(single ? file.createPath : file.part) + file.filename.replace('.ejs', '')}`,
          props: props,
        })
        return res.concat(generator)
      }, generators)
    }
    await Promise.all(generators)
    await toolbox.loader.succeed()
    toolbox.loader = null

    const cwf = path.join(cwd(), props.name)
    await spawn(`kc id`,{ 
      cwd: cwf,
      stdio : 'inherit'
    })
  }
}
module.exports = command