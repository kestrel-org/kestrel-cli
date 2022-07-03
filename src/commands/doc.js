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
        template : {saveLog},
        path
      } = toolbox
      const docPath = path.join(frontend_path,"documentation")
      toolbox.loader = infoLoader('Generating documentation')
      let generate_doc = await saveLog.run(`npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend`,{ 
        cwd: frontend_path,
        target : docPath
      })
      await toolbox.loader.succeed()
      toolbox.loader = null

      generate_doc = generate_doc.split("\n")
      log(generate_doc[generate_doc.length-2]);

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
  