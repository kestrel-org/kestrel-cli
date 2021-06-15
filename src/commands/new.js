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
      logColors : {info,error,chalk},
      strings: { kebabCase },
      filesystem: { exists, removeAsync, copyAsync, cwd, separator },
      prompts,
      system,
      template: { generate }
    } = toolbox

    
      //  set up initial props (to pass into templates)
      const options = parameters.options
      let back = Boolean(options.back) || Boolean(options.b)
      let front = Boolean(options.front) || Boolean(options.f)
      let single = Boolean( back ? !front : front )
        
      
      const props = {
        name: parameters.first,
        backend_path : "backend",
        frontend_path : "frontend"
      }

      let toCreate = ""
      let templateFiles = [back_files, front_files, main_files]
      if(single){
        if (front) {
          toCreate = "frontend"
          templateFiles = [front_files,main_files]
          props['fname'] = props.name
          props.frontend_path = ""
          props.backend_path = null
        }
        if (back) {
          toCreate = "backend"
          templateFiles = [back_files,main_files]
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
        toolbox.loader = info('Removing directory',true)
        await removeAsync(props.name)
        toolbox.loader.succeed()
      }
      toolbox.loader = info('Copy directory',true)
      await copyAsync(__dirname + '/../templates/angular-node/' + toCreate, cwd() + separator + props.name, {
        overwrite: true,
        matching: '!*.ejs'
      })
      toolbox.loader.succeed()

      let generators = []
      toolbox.loader = info('Generating templates',true)
      for (let files of templateFiles) {
        generators = files.toTransform.reduce((res, file) => {
          const generator = generate({
            template: `${file.path + file.filename}.ejs`,
            target: `${props.name}/${(single ? file.createPath : file.part) + file.filename.replace('.ejs', '')}`,
            props: props,
          }).catch((err)=>{error(err);return undefined})
          return res.concat(generator)
        }, generators)
      }
      await Promise.all(generators)
      toolbox.loader.succeed()

      let installs = [];
      toolbox.loader = info('Install dependencies',true)
      if (single) {
        installs.push(
          system.spawn(`cd ${props.name} && npm install --silent --quiet --progress=false`, { 
            shell: true
          })
        )
      } else {
        installs.push(
          system.spawn(`cd ${props.name}/frontend && npm install --silent --quiet --progress=false`,{ 
            shell: true
          }),
          system.spawn(`cd ${props.name}/backend && npm install --silent --quiet --progress=false`,{ 
            shell: true
          })
        )
      }
      await Promise.all(installs)
      toolbox.loader.succeed()
      info(`Project ${chalk.white.bold(props.name)} created ! `)
    
    
  }
}
module.exports = command