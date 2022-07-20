import { Command } from "@src/types/Command";
import { ProjectUse } from "@src/types/Project";
import dotenv from 'dotenv';
import { Options } from "ora";

const command : Command = {
  name: 'initdb',
  aliases:['idb'],
  scope : "in",
  needs : ["backend"],
  foldersToWatch : {backend : ["src/models","src/seeders","src/migrations"]},
  arguments: [{
    name: "env",
    description: "Environnment to use when initialising the database\n Possible values : DEV, TEST, PROD",
    required: false,
    default : "DEV"
  }],
  description : "Init database with fake data.",
  run: async (toolbox,options,args,command) => {
    const {
      strings : {upperCase,lowerCase},
      print : {info,infoLoader,error,log},
      saveLog,
      path,
      system : {run},
      exit
    } = toolbox
    
    const {
      backend_path
    } = toolbox.project as ProjectUse
    
    dotenv.config({ path: path.join(backend_path,".env") })

    let env = upperCase(args[0]);

    const available_envs = ["DEV","TEST","PROD"]
    let env_vars = ["DB_SCHEMA_","DB_USERNAME_","DB_PASSWORD_"]
    
    // Sanity check
    if(env){
      if(!available_envs.includes(env)){
        const errorMsg = [
          'Specified environment does not exist',
          `Available environments : ${available_envs.join(",")}`
        ]
        exit(command,errorMsg)
      }
    }

    env_vars = env_vars.map(evar => {
      if(!process.env[`${evar+env}`]){
        exit(command,`Environment variable '${evar+env}' was not set corectly.`)
      }
      return `${evar+env}`
    })

    env = lowerCase(env)
    
    info('---- Database Initialization ----')
    
    // @ts-ignore
    toolbox.loader.start(infoLoader('Database removal'))
    let db_removal = await run('npx', `sequelize-cli db:drop --env ${env}`,{ 
      cwd: backend_path
    })
    await toolbox.loader.succeed()
    log(db_removal);

    toolbox.loader.start(infoLoader('Database generation'))
    let db_gen = await run('npx', `sequelize-cli db:create --env ${env}`,{ 
      cwd: backend_path
    })
    await toolbox.loader.succeed()
    log(db_gen);

    toolbox.loader.start(infoLoader('Tables generation'))
    let tables_gen = await run('npx',`sequelize-cli db:migrate --env ${env}`,{ 
      cwd: backend_path
    })
    await toolbox.loader.succeed()
    log(tables_gen);

    toolbox.loader.start(infoLoader('Models generation'))
    let models_gen = await saveLog.run({
      command : 'node' ,
      args : `node_modules/sequelize-auto/bin/sequelize-auto -o \"./src/models\" -d ${process.env[env_vars[0]]!} -h localhost -u ${process.env[env_vars[1]]!} -p 3306 -x ${process.env[env_vars[2]]!} -e mysql --skipTables sequelizemeta --noInitModels`,
      options : { 
        cwd: backend_path
      }
    })
    await toolbox.loader.succeed()
    log(models_gen);

    toolbox.loader.start(infoLoader('Data insertion'))
    let data_gen = await run('npx',`sequelize-cli db:seed:all --env ${env}`,{ 
      cwd: backend_path
    })
    await toolbox.loader.succeed()
    log(data_gen);

    info('Database initialized !')

  }
}
  
export default command
  