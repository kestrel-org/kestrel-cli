const command = {
  name: 'database',
  alias:['db'],
  scope : "in",
  needs : ["backend"],
  description : "Generate commands based on sequelize instructions",
  run: async toolbox => {
    const {
      system : {run},
      prints:  {log,info,error},
      strings : {upperCase,lowerCase},
      filesystem : {read},
      parameters : {first,options},
      path,
      project_def,

    } = toolbox
    // Get the project defintion as json
    const def_content = read(project_def,"json")
    const root_dir = path.dirname(project_def)
    const backend_path = path.join(root_dir,def_content.projects.backend_path)

    let sqlz_cmd;
    let command_name;
    if(first == "generate:models" || options.p == "generate:models" || options.t == "generate:models"){

      let env_arg = "dev"

      if(Object.keys(options).length>1){
        error("Please use only one option to set the environment !")
        process.exit(0)
      }

      if(options.p){
        env_arg = "prod"
      }
      if(options.t){
        env_arg = "test"
      }

      require('dotenv').config({ path: path.join(backend_path,".env") })

      let env = upperCase(env_arg);

      const available_envs = ["DEV","TEST","PROD"]
      let env_vars = ["DB_SCHEMA_","DB_USERNAME_","DB_PASSWORD_"]
      
      // Sanity check
      if(env){
        if(!available_envs.includes(env)){
          error('Specified environment does not exist')
          error(`Available environments : ${available_envs.join(",")}`)
          process.exit(0)
        }
      }

      env_vars = env_vars.map(evar => {
        if(!process.env[`${evar+env}`]){
          error(`Environment variable '${evar+env}' was not set corectly.`)
          process.exit(0)
        }
        return `${evar+env}`
      })

      env = lowerCase(env)

      sqlz_cmd = `node node_modules/sequelize-auto/bin/sequelize-auto -o \"./src/models\" -d ${process.env[env_vars[0]]} -h localhost -u ${process.env[env_vars[1]]} -p 3306 -x ${process.env[env_vars[2]]} -e mysql --skipTables sequelizemeta"`
      command_name = "generate-models"
    }else{
      let command = first;
      if(!command){
        error("Please specify a command to run : ex - kc db db:migrate --options")
        process.exit(0)
      }
      let options_str = [];
      for(let name in options){
        let dashes = "-"
        if(name.length>1){
          dashes="--"
        }
        options_str.push(`${dashes+name}=${options[name]}`)
      }
      sqlz_cmd = `npx sequelize-cli ${command} ${options_str.join(" ")}`
      command_name = `${command} ${options_str.join(" ")}`
    }
    toolbox.loader = info(`Running sequelize command : ${command_name} `,true)
    let sequelize_cmd = await run(`${sqlz_cmd}`,{
      cwd : backend_path
    })
    toolbox.loader.succeed()
    log(sequelize_cmd)

  }
}

module.exports = command
