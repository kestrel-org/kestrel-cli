import {Aliases, CommandsObject} from "@src/types/Command";
import Project from "@src/types/Project";
import {Command as Cli} from "commander";
import path from 'path';

import { prompt} from '@src/extensions/toolbox/prompts-tools.js';
import { print} from "@src/extensions/toolbox/print-tools.js";
import { buildLoader } from "@src/extensions/toolbox/loader-tools/worker.js";
import { fileSystem} from "@src/extensions/toolbox/filesystem-tools.js";
import { strings} from "@src/extensions/toolbox/strings-tools.js";
import { buildTemplate } from '@src/extensions/toolbox/template-tools.js';
import { system} from '@src/extensions/toolbox/system-tools.js';
import { buildSave } from '@src/extensions/toolbox/saveLog-tools/save.js'
import { patching } from "./patching-tools.js";
import { KcToolbox } from "@src/types/toolbox/toolbox.js";
import { FileSystemUpdate } from "@src/types/toolbox/saveLog/FsAction.js";
import { meta } from "./meta-tools.js";
import { exitHelp } from "@src/utils/exit-with-help.js";

/**
 * @class Toolbox
 * class passed to all commands as parameter
*/
export class Toolbox implements KcToolbox {
    project : Project = {};
    fileSystemUpdates : FileSystemUpdate[] = [];
    commands : CommandsObject = {};
    aliases : Aliases = {};
    // Known Extensions
    exit = exitHelp
    cli = new Cli();
    meta = meta;
    loader = buildLoader();
    path = path;
    fileSystem = fileSystem;
    patching = patching;
    print = print;
    prompts = prompt;
    strings = strings;
    system = system;
    template = buildTemplate(this);
    saveLog = buildSave(this);
}

export default new Toolbox()