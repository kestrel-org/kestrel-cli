import {ParseOptions, Command as program,Option} from "commander";
import { readdirSync } from 'node:fs';
import * as url from 'url';
import path from 'path';
import {Command} from "@src/types/Command";
import scopeExt from '@src/extensions/scope-check.js';
import toolbox from "@src/extensions/toolbox/toolbox.js";
import errorsHandler from "@src/extensions/exit-handler.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function run(argv?: readonly string[] | undefined, options?: ParseOptions | undefined){

    const commands : string[] = readdirSync(path.join(__dirname,'commands'));
    for (const commandFile of commands) {
        const command : Command = (await import(`./commands/${commandFile.replace(".ts",".js")}`)).default
        const action = toolbox.cli.command(command.name)
        .aliases(command.aliases || [])
        .description(command.description || "")
        .action(function (this : program) {
            command.run(toolbox,this.opts(),this.processedArgs,this)
        });

        // Add command arguments to commander.js

        if(command.arguments){
            for(const argument of command.arguments){
                const name = argument.required ? `<${argument.name}>` : `[${argument.name}]`
                action.argument(name,argument.description,argument.default)
            }
        }

        // Add command options to commander.js

        if(command.options){
            for(const opt of command.options){
                const option = new Option(opt.flags, opt.description)
                if(opt.default){
                    option.default(opt.default)
                }
                if(opt.conflict){
                    option.conflicts(opt.conflict)
                }
                action.addOption(option)
            }
        }

        // Populate toolbox.commands and toolbox.aliases with commands read from the commands folder

        action.showHelpAfterError()
        toolbox.commands[command.name] = command
        command.aliases?.forEach((alias)=>{
            toolbox.aliases[alias] = command.name
        })
        
    }

    // Custom commander error display

    toolbox.cli.configureOutput({
        outputError: (str, write) => write(toolbox.print.chalk.red.bold(`Kestrel-cli : ${str}`))
    });

    // Load all extensions before running commands

    toolbox.cli.hook('preAction', (thisCommand, actionCommand) => {
        scopeExt(toolbox,toolbox.commands[actionCommand.name()])
        errorsHandler(toolbox,actionCommand)
    });

    // Run command

    toolbox.cli.parse(argv,options);
}

export default run

