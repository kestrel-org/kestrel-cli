const path = require('path')
const { inherits } = require('util')
const command = {
    name: 'initDB',
    alias:['iDB'],
    scope : "in",
    description : "Init database with fake data.",
    run: async toolbox => {
      const {
        project_def,
        parameters,
        prompts,
        filesystem : {read},
        strings : {upperCase,lowerCase},
        system,
        logColors : {info,error,chalk},
      } = toolbox
    
      // Get the project defintion as json
      const def_content = read(project_def,"json")
      const root_dir = path.dirname(project_def)
      const backend_path = path.join(root_dir,def_content.projects.backend_path)

      require('dotenv').config({ path: path.join(backend_path,".env") })

      let env = upperCase(parameters.first) || "DEV";

      const available_envs = ["DEV","TEST","PROD"]
      let env_vars = ["DB_SCHEMA_","DB_USERNAME_","DB_PASSWORD_"]
      
      // Sanity check
      if(env){
        if(!available_envs.includes(env)){
          error('Specified environment does not exist')
          error(`Available environments : ${available_envs.join(",")}`)
          return undefined
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
      
      toolbox.loader = info('Database Initialization \n',true)
      await Promise.all([system.spawn(`cd ${backend_path}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      toolbox.loader = info('Database removal ',true)
      await Promise.all([system.spawn(`npx sequelize-cli db:drop --env ${env}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      toolbox.loader = info('Database generation ',true)
      await Promise.all([system.spawn(`npx sequelize-cli db:create --env ${env}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      toolbox.loader = info('Tables generation ',true)
      await Promise.all([system.spawn(`npx sequelize-cli db:migrate --env ${env}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      toolbox.loader = info('Models generation ',true)
      await Promise.all([system.spawn(`npm run generate-models -- ${process.env[env_vars[0]]} ${process.env[env_vars[1]]} ${process.env[env_vars[2]]}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      toolbox.loader = info('Data insertion ',true)
      await Promise.all([system.spawn(`npx sequelize-cli db:seed:all --env ${env}`,{ 
        shell: true
      })])
      toolbox.loader.succeed()

      info('Database initialized !')
      
    }
  }
  
  module.exports = command
  