const path = require('path')
const command = {
    name: 'initdb',
    alias:['idb'],
    scope : "in",
    needs : ["backend"],
    foldersToWatch : {backend : ["src/models","src/seeders","src/migrations"]},
    description : "Init database with fake data.",
    run: async toolbox => {
      const {
        project : {
          backend_path
        },
        parameters,
        strings : {upperCase,lowerCase},
        prints : {info,infoLoader,error,log},
        template: {saveLog},
        system : {run}
      } = toolbox
    
      // Get the project defintion as json

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
      
      info('---- Database Initialization ----')
      
      
      toolbox.loader = infoLoader('Database removal')
      let db_removal = await run(`npx sequelize-cli db:drop --env ${env}`,{ 
        cwd: backend_path
      })
      toolbox.loader.succeed()
      log(db_removal);

      toolbox.loader = infoLoader('Database generation')
      let db_gen = await run(`npx sequelize-cli db:create --env ${env}`,{ 
        cwd: backend_path
      })
      toolbox.loader.succeed()
      log(db_gen);

      toolbox.loader = infoLoader('Tables generation')
      let tables_gen = await run(`npx sequelize-cli db:migrate --env ${env}`,{ 
        cwd: backend_path
      })
      toolbox.loader.succeed()
      log(tables_gen);

      toolbox.loader = infoLoader('Models generation')
      let models_gen = await saveLog.run(`node node_modules/sequelize-auto/bin/sequelize-auto -o \"./src/models\" -d ${process.env[env_vars[0]]} -h localhost -u ${process.env[env_vars[1]]} -p 3306 -x ${process.env[env_vars[2]]} -e mysql --skipTables sequelizemeta --noInitModels`,{ 
        cwd: backend_path
      })
      toolbox.loader.succeed()
      log(models_gen);

      toolbox.loader = infoLoader('Data insertion')
      let data_gen = await run(`npx sequelize-cli db:seed:all --env ${env}`,{ 
        cwd: backend_path
      })
      toolbox.loader.succeed()
      log(data_gen);

      info('Database initialized !')

    }
  }
  
  module.exports = command
  