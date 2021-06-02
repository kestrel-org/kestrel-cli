import { GluegunToolbox } from 'gluegun'

type TemplateProps = {
  name: string
}

const command  = {
  name: 'new',
  alias: ['n'],
  help : {
    
  },
  description : "Create new project",
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters,
      print:{error,info},
      strings:{kebabCase},
      filesystem:{exists,dir,remove},
      template : {generate},
      prompt,
      system
    } = toolbox

     // set up initial props (to pass into templates)
    //  const options = parameters.options
    //  const back = Boolean(options.back)
    //  const front = Boolean(options.front)

     const props: TemplateProps = {
        name: parameters.first
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

    if(exists(props.name)){
      error(`A directory named ${props.name} already exists !`)
      const overwrite = await prompt.confirm('Overwrite ?')
      if(!overwrite){
        return undefined
      }
      remove(props.name)
    }

    dir(props.name)

    let generators = []

    const back_files = [
      'src/configs/checkAuthenticated.js.ejs',
      'src/configs/checkToken.js.ejs',
      'src/configs/cors.js.ejs',
      'src/configs/helmet.js.ejs',
      'src/configs/logger.js.ejs',
      'src/configs/session.js.ejs',
      'src/configs/swagger.js.ejs',
      'src/migrations/20200308160133-create-users.js.ejs',
      'src/models/index.js.ejs',
      'src/models/users.js.ejs',
      'src/routes/exemple.js.ejs',
      'src/routes/routes.js.ejs',
      'src/seeders/20200308184954-insert-users.js.ejs',
      'src/utils/asyncForEach.js.ejs',
      'src/utils/crypto.js.ejs',
      'src/utils/PDFGenerator.js.ejs',
      'src/app.js.ejs',
      'src/server.js.ejs',
      'tests/exemple.spec.js.ejs',
      '.babelrc.ejs',
      '.env.ejs',
      '.gitignore.ejs',
      '.sequelizerc.ejs',
      'dbconfig.js.ejs',
      'package.json.ejs'
    ]
    generators = back_files.reduce((res,file)=>{
      const generator = generate({
        template: `backend/${file}`,
        target: `${props.name}/${file.replace('.ejs', '')}`,
        props: props,
      })
      return res.concat(generator)
    },generators)

    await Promise.all(generators)

    await system.spawn(`cd ${props.name} && npm install --silent`, {
      shell: true,
      stdio: 'inherit',
    })
    info("Backend created ! ")
  }
}
export default command
