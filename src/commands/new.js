const back_files = require('../assets/back_files')
const front_files = require('../assets/front_files')
const main_files = require('../assets/main_files')
const git = require('git-promise');

const command = {
  name: 'new',
  alias: ['n'],
  scope: "out",
  description: "Create new project",
  run: async toolbox => {
    const {
      parameters,
      prints: { info, error, chalk },
      strings: { kebabCase },
      filesystem: { exists, removeAsync, copyAsync, cwd, separator },
      prompts,
      path,
      meta: { version },
      system: { run },
      template: { generate }
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
      kli_version: version()
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
      error(`A directory named ${props.name} already exists !`)
      const overwrite = await prompts.confirm('Overwrite ?')
      if (!overwrite) {
        return undefined
      }
      toolbox.loader = info('Removing directory', true)
      await removeAsync(props.name)
      toolbox.loader.succeed()
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

          await git(`clone https://github.com/ngx-template/ngx-template.git ${__dirname}/../templates/angular-node`)
          await run("node " + __dirname + "/../utils/convertToTemplate.js")
          resolve(true)
        } catch (err) {
          error(`The download of the github repository has failed.`)
          resolve(false)
        }
      });
    }

    toolbox.loader = info('Downloading template', true)
    const isDownloaded = await downloadTemplate()

    if (!isDownloaded) {
      process.exit(0)
    } else {
      toolbox.loader.succeed()
      toolbox.loader = info('Copying directory', true)
      await copyAsync(__dirname + '/../templates/angular-node/' + toCreate, cwd() + separator + props.name, {
        overwrite: true,
        matching: [
          './!(.github|.git|ROADMAP.md|CHANGELOG.md|.mergify.yml|README.md|*.ejs)',
          './!(.github|.git)/**/!(*.ejs)'
        ]
      })
      toolbox.loader.succeed()

      let generators = []
      toolbox.loader = info('Generating templates', true)
      for (let files of templateFiles) {
        generators = files.toTransform.reduce((res, file) => {
          const generator = generate({
            template: `${file.path + file.filename}.ejs`,
            target: `${props.name}/${(single ? file.createPath : file.part) + file.filename.replace('.ejs', '')}`,
            props: props,
          }).catch((err) => { error(err); return undefined })
          return res.concat(generator)
        }, generators)
      }
      await Promise.all(generators)
      toolbox.loader.succeed()

      let installs = [];
      toolbox.loader = info('Installing dependencies', true)
      const cwf = path.join(cwd(), props.name)
      if (single) {
        installs.push(
          run(`npm install`, {
            cwd: cwf
          }).catch(err => {
            toolbox.loader.fail()
            error(err)
            error(err.stdout)
            error(err.stderr)
            process.exit(0)
          })
        )
      } else {
        installs.push(
          run(`npm install`, {
            cwd: path.join(cwf, "backend")
          }).catch(err => {
            toolbox.loader.fail()
            error(err)
            error(err.stdout)
            error(err.stderr)
            process.exit(0)
          }),
          run(`npm install`, {
            cwd: path.join(cwf, "frontend")
          }).catch(err => {
            toolbox.loader.fail()
            error(err)
            error(err.stdout)
            error(err.stderr)
            process.exit(0)
          })
        )
      }
      await Promise.all(installs)
      toolbox.loader.succeed()
      info(`Project ${chalk.white.bold(props.name)} created ! `)
    }
  }
}
module.exports = command