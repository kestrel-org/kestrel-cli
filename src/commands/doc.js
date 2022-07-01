const updateFileSystem = require('../extensions/utils/updateFileSystem')
const command = {
    name: 'doc',
    alias:[],
    scope : "in",
    needs : ["frontend"],
    description : "Build the documentation for the frontend",
    run: async toolbox => {
      const {
        project : {
          frontend_path
        },
        parameters : {options},
        system : {run,spawn},
        prints : {info,log,infoLoader},
        filesystem : {exists},
        path
      } = toolbox

      toolbox.loader = infoLoader('Generating documentation')
      let generate_doc = await run(`npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend`,{ 
        cwd: frontend_path
      })
      toolbox.loader.succeed()
      toolbox.loader = null

      generate_doc = generate_doc.split("\n")
      log(generate_doc[generate_doc.length-2]);
      
      const docPath = path.join(frontend_path,"documentation")
      let action = "CREATE"
      if(exists(docPath))
        action = "UPDATE"
      updateFileSystem(toolbox,docPath,action)

      if(options.s || options.serve)
      {
        info('Serving documentation')
        await spawn(`cd ${frontend_path} && npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend -s`,{
          shell:true,
          stdio : "inherit"
        });
      }
    }
  }
  
  module.exports = command
  