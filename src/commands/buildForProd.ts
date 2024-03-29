import { FsAction } from '@src/toolbox/saveLog-tools/fsAction.js'
import { BackCors } from '@src/types/backCors'
import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'

import url from 'url'
import util from 'util'

const command: Command = {
  name: 'build',
  scope: 'in',
  needs: ['frontend', 'backend'],
  description: 'Build project for production',
  run: async (toolbox, options, args, command) => {
    const {
      print: { infoLoader },
      fileSystem: {
        writeAsync,
        copyAsync,
        exists,
        removeAsync,
        dirAsync,
        findAsync,
        readAsync,
      },
      system: { run },
      prompts,
      patching: { patch },
      template: { generate },
      saveLog,
      path,
      exit,
    } = toolbox

    const { project_def, backend_path, frontend_path } =
      toolbox.project as ProjectUse

    const root_dir = path.dirname(project_def)
    const back_cors_path = path
      .join(backend_path, 'src/configs/cors/config.js')
      .replace(/\\/g, '/')
    const front_cors_path = path
      .join(frontend_path, 'src/environments/environment.prod.ts')
      .replace(/\\/g, '/')

    // @ts-ignore
    let back_cors = (await import(url.pathToFileURL(back_cors_path))).default

    // Modify cors config before build

    let cors_conf = await prompts.confirm(
      'Do you want to modify the cors config ?'
    )

    if (cors_conf) {
      function validateAddress(address: string) {
        let pattern =
          /(\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b)|localhost|(^((?:([a-z0-9]\.|[a-z0-9][a-z0-9\-]{0,61}[a-z0-9])\.)+)([a-z0-9]{2,63}|(?:[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]))\.?$)/gi
        let test = pattern.test(address)
        if (!test || address.length <= 0) {
          return 'Enter valid address - ex : 192.168.0.1, localhost or example.com'
        }
        return true
      }

      let url = await prompts.ask('Enter domain name or IP ', validateAddress)
      url = `https://${url}`

      let is_present = (back_cors as BackCors).whitelist.some(
        (address) => url == address
      )

      if (!is_present) {
        back_cors.whitelist = back_cors.whitelist.concat([url])
      }

      await writeAsync(
        `${back_cors_path}`,
        `export default ${util.inspect(back_cors)}`,
        { jsonIndent: 4 }
      )
      await patch(
        front_cors_path,
        {
          insert: `API_URL: '${url}/api/'`,
          replace: new RegExp(/API_URL.*'.*'/g),
        },
        {
          insert: `ORIGIN_URL: '${url}'`,
          replace: new RegExp(/ORIGIN_URL.*'.*'/g),
        }
      )
    }
    let build_dir = path.join(root_dir, 'dist')

    // Check for certificates

    let key_certificate = await findAsync(path.join(root_dir, 'sslcert'), {
      matching: '*.key',
    })
    if (key_certificate.length != 1) {
      exit(
        command,
        'Found zero or multiple .key files, did you put it in the sslcert folder ?'
      )
    }
    let crt_certificate = await findAsync(path.join(root_dir, 'sslcert'), {
      matching: '*.crt',
    })
    if (crt_certificate.length != 1) {
      exit(
        command,
        'Found zero or multiple .crt files, did you put it in the sslcert folder ?'
      )
    }

    let buildExist = FsAction.Create

    // Building backend to dist

    if (exists(build_dir)) {
      buildExist = FsAction.Update
      toolbox.loader.start(infoLoader('Deleting previous build directory'))
      await removeAsync(build_dir)
      await toolbox.loader.succeed()
    }
    toolbox.loader.start(infoLoader('Copying backend to dist'))
    await copyAsync(backend_path, build_dir, {
      overwrite: true,
      matching: ['./!(node_modules)', './!(node_modules)/**/!(server.js)'],
    })

    // Remove useless scripts from package.json fro the build

    const packageJson = await readAsync(
      path.join(build_dir, 'package.json'),
      'json'
    )
    packageJson.scripts.start =
      'node --es-module-specifier-resolution=node ./src/server.js'
    delete packageJson.nodemonConfig
    await writeAsync(
      `${path.join(build_dir, 'package.json')}`,
      JSON.stringify(packageJson, null, 2)
    )

    await toolbox.loader.succeed()
    toolbox.loader.start(infoLoader('Installing backend dependencies'))
    await run('npm', 'install --silent', {
      cwd: build_dir,
    })
    await toolbox.loader.succeed()

    // Update app.js to be able to communicate with angular

    toolbox.loader.start(infoLoader('Update app.js for production'))
    let dirnameString =
      "import * as url from 'url';\nimport path from 'path';\nconst __dirname = path.dirname(url.fileURLToPath(import.meta.url))\n"
    let angularStr =
      "// Angular \napp.use(express.static(path.join(__dirname, \"public\")));\napp.get('**', function (req, res) {\n\tres.sendFile(__dirname + '/public/index.html');\n});\n\n"
    await patch(path.join(build_dir, 'src/app.js'), {
      insert: angularStr,
      before: '// catch 404',
    })
    await patch(path.join(build_dir, 'src/app.js'), {
      insert: dirnameString,
      before: 'const app = express();',
    })
    await dirAsync(path.join(build_dir, 'src/public'))
    await toolbox.loader.succeed()

    if (!exists(path.join(frontend_path, 'node_modules'))) {
      toolbox.loader.start(infoLoader('Installing frontend dependencies'))
      await run('npm', 'install --silent', {
        cwd: frontend_path,
      })
      await toolbox.loader.succeed()
    }

    // Building frontend to dist

    toolbox.loader.start(infoLoader('Building frontend to dist/src/public'))
    await saveLog.run({
      command: 'ng',
      args: `build --configuration=production --output-path=${path.relative(
        frontend_path,
        path.join(build_dir, 'src/public')
      )}`,
      action: buildExist,
      target: build_dir,
      options: {
        cwd: frontend_path,
      },
    })

    await toolbox.loader.succeed()

    // Updating server.js to use certificates

    toolbox.loader.start(infoLoader('Generating new server file'))
    await generate({
      template: 'buildForProd/server.js.ejs',
      target: `${path.join(build_dir, 'src/server.js')}`,
      props: {
        sslkey: path.basename(key_certificate[0]),
        sslcrt: path.basename(crt_certificate[0]),
      },
    })
    await patch(path.join(build_dir, 'src/server.js'), {
      insert: dirnameString,
      after: "import fs from 'fs';",
    })
    await toolbox.loader.succeed()
  },
}

export default command
