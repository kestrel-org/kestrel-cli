const back_files = require('../assets/back_files')
const front_files = require('../assets/front_files')
const main_files = require('../assets/main_files')

const command = {
  name: 'new',
  alias: ['n'],
  scope : "out",
  description: "Create new project",
  run: async toolbox => {
    const {
      parameters,
      print: { error, info},
      strings: { kebabCase },
      filesystem: { exists, remove, copy, cwd, separator },
      prompts,
      system,
      template: { generate }
    } = toolbox

    //  set up initial props (to pass into templates)
    const options = parameters.options
    let back = Boolean(options.back) || Boolean(options.b)
    let front = Boolean(options.front) || Boolean(options.f)
    const props = {
      name: parameters.first,
      backend_path : "backend"
    }

    let toCreate = ""
    let templateFiles = [back_files, front_files, main_files]
    let single = false;

    if (front && !back) {
      toCreate = "frontend"
      templateFiles = [front_files]
      props['fname'] = props.name
      single = true
    }
    if (back && !front) {
      toCreate = "backend"
      templateFiles = [back_files]
      props['bname'] = props.name
      single = true
      props.backend_path = ""
    }

    if (!props.name || props.name.length === 0) {
      error('You must provide a valid project name.')
      error('Example: kc new franklin')
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
      info(`Removing directory`)
      remove(props.name)
    }
    info(`Copy directory`)
    copy(__dirname + '/../templates/angular-node/' + toCreate, cwd() + separator + props.name, {
      overwrite: true,
      matching: '!*.ejs'
    })

    let generators = []
    for (let files of templateFiles) {
      generators = files.toTransform.reduce((res, file) => {
        const generator = generate({
          template: `${file.path + file.filename}.ejs`,
          target: `${props.name}/${(single ? file.createPath : file.part) + file.filename.replace('.ejs', '')}`,
          props: props,
        })
        return res.concat(generator)
      }, generators)
    }
    info(`Generate templates`)
    await Promise.all(generators)

    let installs = [];
    if (single) {
      installs.push(
        system.spawn(`cd ${props.name} && npm install --silent`, {
          shell: true,
          stdio: 'inherit',
        })
      )
    } else {
      installs.push(
        system.spawn(`cd ${props.name}/frontend && npm install --silent`, {
          shell: true,
          stdio: 'inherit',
        }),
        system.spawn(`cd ${props.name}/backend && npm install --silent`, {
          shell: true,
          stdio: 'inherit',
        })
      )
    }
    info('Install dependencies')
    await Promise.all(installs)
    info(`Project ${props.name} created ! `)
  }
}
module.exports = command