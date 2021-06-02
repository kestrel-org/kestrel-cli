import { GluegunToolbox } from 'gluegun'
import back_files from '../assets/back_files'

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

    //  set up initial props (to pass into templates)
    const options = parameters.options
    let back = Boolean(options.back)
    let front = Boolean(options.front)

    if(!front && !back){
      front = true
      back = true
    }

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
