import {ParseOptions, Command as program} from "commander";
import { readdirSync } from 'node:fs';
import * as url from 'url';
import path from 'path';
import {Command} from "@src/types/command";
import scopeExt from '@src/extensions/scope-check.js';
import toolbox from "@src/extensions/toolbox/toolbox.js";

import errorsHandler from "@src/extensions/exit-handler.js";


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const cli = new program()
toolbox.cli = cli

async function run(argv?: readonly string[] | undefined, options?: ParseOptions | undefined){
    // Get cli version
    const packageJson = await toolbox.fileSystem.readAsync(`${__dirname}/../package.json`,"json")
    toolbox.meta.version = packageJson.version

    const commands : string[] = readdirSync(path.join(__dirname,'commands'));
    for (const commandFile of commands) {
        const command : Command = (await import(`./commands/${commandFile.replace(".ts",".js")}`)).default
        const action = cli.command(command.name)
        .aliases(command.aliases || [])
        .description(command.description || "")
        .action(function (this : program) {
            command.run(toolbox,this.opts(),this.args)
        });

        if(command.arguments){
            for(const argument of command.arguments){
                const name = argument.required ? `<${argument.name}>` : `[${argument.name}]`
                action.argument(name,argument.description,argument.default)
            }
        }

        if(command.options){
            for(const opt of command.options){
                action.option(opt.flags,opt.description,opt.default)
            }
        }
        toolbox.commands[command.name] = command
    }
    cli.configureOutput({
        // Visibly override write routines as example!
        // writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
        // writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
        // Highlight errors in color.
        outputError: (str, write) => write(toolbox.print.chalk.red.bold(str))
    });

    cli.hook('preAction', (thisCommand, actionCommand) => {
        scopeExt(toolbox,toolbox.commands[actionCommand.name()])
        errorsHandler(toolbox,actionCommand)
    });

    cli.parse(argv,options);
}

export default run

