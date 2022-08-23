import { Aliases, CommandsObject } from '@src/types/command'
import Project from '@src/types/project'
import { Command as Cli } from 'commander'
import path from 'path'

import { prompt } from '@src/toolbox/prompts-tools.js'
import { print } from '@src/toolbox/print-tools.js'
import { buildLoader } from '@src/toolbox/loader-tools/worker.js'
import { fileSystem } from '@src/toolbox/filesystem-tools.js'
import { strings } from '@src/toolbox/strings-tools.js'
import { buildTemplate } from '@src/toolbox/template-tools.js'
import { system } from '@src/toolbox/system-tools.js'
import { buildSave } from '@src/toolbox/saveLog-tools/save.js'
import { patching } from './patching-tools.js'
import { KcToolbox } from '@src/types/toolbox/toolbox.js'
import { FileSystemUpdate } from '@src/types/toolbox/saveLog/fileSystem'
import { meta } from './meta-tools.js'
import { exitHelp } from '@src/utils/exit-with-help.js'

/**
 * @class Toolbox
 * class passed to all commands as parameter
 */
export class Toolbox implements KcToolbox {
  project: Project = {}
  fileSystemUpdates: FileSystemUpdate[] = []
  commands: CommandsObject = {}
  aliases: Aliases = {}
  command?: Cli = undefined
  // Known Extensions
  exit = exitHelp
  cli = new Cli()
  meta = meta
  loader = buildLoader()
  path = path
  fileSystem = fileSystem
  patching = patching
  print = print
  prompts = prompt
  strings = strings
  system = system
  template = buildTemplate(this)
  saveLog = buildSave(this)
}

export default new Toolbox()
