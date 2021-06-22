const command = {
    name: 'doc',
    alias:[],
    scope : "in",
    needs : ["frontend"],
    description : "Build the documentation for the frontend",
    run: async toolbox => {
      const {
        project_def,
        parameters : {options},
        filesystem : {read},
        system : {run,spawn},
        path,
        prints : {info,error,log},
      } = toolbox

      // Get the project defintion as json
      
      const def_content = read(project_def,"json")
      const root_dir = path.dirname(project_def)
      const frontend_path = path.join(root_dir,def_content.projects.frontend_path)

      toolbox.loader = info('Generating documentation ',true)
      let generate_doc = await run(`npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend`,{ 
        cwd: frontend_path
      })
      toolbox.loader.succeed()
      toolbox.loader = null

      generate_doc = generate_doc.split("\n")
      log(generate_doc[generate_doc.length-2]);
      
      
      if(options.s || options.serve)
      {
        info('Serving documentation ')
        let serve = await spawn(`cd ${frontend_path} && npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend -s`,{
          shell:true,
          stdio : "inherit"
        });
        if(serve.error){
          error(error.toString())
          return undefined;
        }
      }
    }
  }
  
  module.exports = command
  