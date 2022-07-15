import {CommandsObject} from "@src/types/command";
import Project from "@src/types/project";
import {Command as Cli} from "commander";

import path from 'path';
import url from 'url';

import prompts from '@src/extensions/toolbox/dialogs/prompts.js';
import print from "@src/extensions/toolbox/dialogs/print.js";
import Loader from "@src/extensions/toolbox/dialogs/loader/worker.js";
import FileSystem from "@src/extensions/toolbox/filesystem-tools.js";
import Strings from "@src/extensions/toolbox/strings-tools.js";
import Generate from '@src/extensions/toolbox/generate-tools.js';
import SystemTools from '@src/extensions/toolbox/system-tools.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

class Toolbox {
    cli?: Cli;
    loader = new Loader();
    fileSystemUpdates? : Array<{
        action : "UPDATE" | "CREATE"
        path : string,
        size : number
    }>;
    commands : CommandsObject = {};
    project : Project = {};
    fileSystem = FileSystem;
    strings = Strings;
    template = {
        generate : Generate(this)
    }
    prompts = prompts;
    print = print;
    meta = {
        directory : path.join(__dirname,'../..'),
        version : ""
        
    };
    path = path;
    system = SystemTools;
}
export {Toolbox}

export default new Toolbox()