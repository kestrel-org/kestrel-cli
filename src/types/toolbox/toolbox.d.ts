import { Save } from '@src/extensions/toolbox/saveLog-tools/save'
import { PlatformPath } from 'path'
import { KcFileSystem } from './fileSystem-tools'
import { KcPatching } from './patching-tools'
import { KcPrint } from './print-tools'
import { KcPrompts } from './prompts-tools'
import { FileSystemUpdate } from './saveLog/FsAction'
import { KcStrings } from './strings-tools'
import { KcSystem } from './system-tools'
import { KcTemplate } from './template-tools'
import { Command as Cli } from 'commander'
import { Loader } from '@src/extensions/toolbox/loader-tools/worker'
import { KcMeta } from './meta-tools'
import { KcExit } from './exit-with-help'

// Final toolbox
export interface KcToolbox {
  cli?: Cli
  project?: Project
  template?: KcTemplate
  saveLog?: Save
  aliases?: Aliases
  fileSystemUpdates?: FileSystemUpdate[]
  commands?: CommandsObject
  command?: Cli
  // known extensions
  exit: KcExit
  meta: KcMeta
  loader: Loader
  path: PlatformPath
  fileSystem: KcFileSystem
  patching: KcPatching
  print: KcPrint
  prompts: KcPrompts
  strings: KcStrings
  system: KcSystem
}
