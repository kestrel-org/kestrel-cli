const util = require('util')
const command = {
    name: 'build',
    alias:[],
    scope : "in",
    needs : ["frontend","backend"],
    description : "Build project for production",
    run: async toolbox => {
      const {
        project_def,
        prints : {error,info,log,chalk},
        filesystem:{writeAsync,copyAsync,exists,removeAsync, dirAsync, findAsync},
        system : {run},
        prompts,
        patching : {patch},
        template : {generate},
        path,
        filesystem : {read}
      } = toolbox
      
      const def_content = read(project_def,"json")
      const root_dir = path.dirname(project_def)
      const frontend_path = path.join(root_dir,def_content.projects.frontend_path)
      const backend_path = path.join(root_dir,def_content.projects.backend_path)
      const back_cors_path = path.join(backend_path,'src/configs/cors/config').replace(/\\/g,"/")
      const front_cors_path = path.join(frontend_path,'src/environments/environment.prod.ts').replace(/\\/g,"/")

      let back_cors = require(back_cors_path)
      
      let cors_conf = await prompts.confirm("Do you want to modify cors config ?")

      if(cors_conf){
        function validateAddress(address){
          let pattern = /(\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b)|(^((?:([a-z0-9]\.|[a-z0-9][a-z0-9\-]{0,61}[a-z0-9])\.)+)([a-z0-9]{2,63}|(?:[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]))\.?$)/gi
          let test = pattern.test(address)
          if(!test && address.length>0){
            return "Enter valid address - ex : 192.168.0.1 or example.com"
          }
          return true
        }
        let url;
        let urls = []
        prompts.inject(['momo.fr','jaqcuie.com','roberto.lourd','franklin.caca','florent.groszizi','192.168.0.6','','kaka.rc']);
        do{
          url = await prompts.ask("Enter domain names or IPs (empty to stop)",validateAddress);
          if(url.length>0)
            urls.push(`https://${url}`)
        }
        while(url)
        back_cors.whitelist = back_cors.whitelist.concat(urls)

        let base_url = await prompts.ask("Enter base URL fro the app",validateAddress);

        await writeAsync(`${back_cors_path}.js`,`module.exports = ${util.inspect(back_cors)}`,{jsonIndent:4})
        await patch(
          front_cors_path, 
          { insert: `API_URL: 'https://${base_url}/api'`, replace: new RegExp(/API_URL.*'.*'/g) },
          { insert: `ORIGIN_URL: 'https://${base_url}'`, replace: new RegExp(/ORIGIN_URL.*'.*'/g) }
        )

        let build_dir = path.join(root_dir,"dist");

        let key_certificate = await findAsync(path.join(root_dir,"sslcert"),{
          matching : '*.key'
        })
        if(key_certificate.length!=1){
          error("Cannot find .key file, did you put it in the sslcert folder ?")
          process.exit(0)
        }
        let crt_certificate = await findAsync(path.join(root_dir,"sslcert"),{
          matching : '*.crt'
        })
        if(crt_certificate.length!=1){
          error("Cannot find .crt file, did you put it in the sslcert folder ?")
          process.exit(0)
        }

        if(exists(build_dir)){
          toolbox.loader = info("Deleting previous build directory ",true);
          await removeAsync(build_dir)
          toolbox.loader.succeed();
        }
        toolbox.loader = info('Copying backend to dist',true)
        await copyAsync(backend_path, build_dir, {
          overwrite: true,
          matching: [
            './!(node_modules)/**',
            './*.*',
            '!server.js'
          ]
        })
        toolbox.loader.succeed()
        toolbox.loader = info('Installing backend dependencies ',true)
        await run(`npm install --silent`,{ 
          cwd: build_dir
        }).catch(err=>{
          error(err.stdout)
          error(err.stderr)
          return undefined;
        })
        toolbox.loader.succeed()

        toolbox.loader = info('Update app.js for production ',true)
        let angular_str = "// Angular \napp.use(express.static(path.join(__dirname, \"public\")));\napp.get('**', function (req, res) {\n\tres.sendFile(__dirname + '/public/index.html');\n});\n\n"
        await patch(path.join(build_dir,"src/app.js"), { insert: angular_str, before: "// catch 404" })
        await dirAsync(path.join(build_dir,"src/public"))
        toolbox.loader.succeed()

        if(!exists(path.join(frontend_path,"node_modules"))){
          toolbox.loader = info('Installing frontend dependencies ',true)
          await run(`npm install --silent`,{ 
            cwd: frontend_path
          }).catch(err=>{
            error(err.stdout)
            error(err.stderr)
            process.exit(0);
          })
          toolbox.loader.succeed()
        }
        toolbox.loader = info('Building frontend to dist/src/public ',true)
        await run(`ng build --prod --output-path=${path.relative(frontend_path,path.join(build_dir,"src/public"))}`,{ 
          cwd: frontend_path
        }).catch(err=>{
          toolbox.loader.fail()
          error(err.stdout)
          error(err.stderr)
          process.exit(0);
        })
        toolbox.loader.succeed()

        toolbox.loader = info('Generating new server file ',true)
        await generate({
          template: 'buildForProd/server.js.ejs',
          target: `${path.join(build_dir,"src/server.js")}`,
          props: { 
            sslkey : path.basename(key_certificate[0]),
            sslcrt : path.basename(crt_certificate[0])
          },
        })
        toolbox.loader.succeed()

        
      }
    }
  }
  
  module.exports = command
  