import { RunOptions, SpawnOpts, SpawnResult } from '@src/types/toolbox/child-process-options';
import {execa} from 'execa';
import nodeSpawn from 'cross-spawn';
import { isNil } from './utils.js';

/**
 * Executes a commandline via execa.
 *
 * @param {string} commandLine The command line to execute.
 * @param {string[]} [args] The arguments used by the command.
 * @param {RunOptions} [options={}] Additional child_process options for node.
 * @returns {Promise<string|Error>} Promise with result.
 */
async function run(commandLine: string,args? : string[],options: RunOptions = {}): Promise<string|Error> {
  const trimString = options.trim ? (str : any) => str.trim() : (str : any) => str
  return new Promise(async (resolve, reject) => {
    try {
      const result = await execa(commandLine, args, options)
      resolve(trimString(result.stdout))
    }catch(err){
      reject(err)
    }
  })
}

/**
 * Uses cross-spawn to run a process.
 * @param {Object} params
 * @param {string} params.commandLine - The command line to execute.
 * @param {string[]} [params.args] - The arguments used by the command.
 * @param {SpawnOpts} [params.options] - Additional child_process options for node.
 * @returns {Promise<SpawnResult>} The response object.
 */
async function spawn(params : {commandLine: string,args?: string[],options?: SpawnOpts}): Promise<SpawnResult> {
  
  return new Promise((resolve, _reject) => {
    const spawned = nodeSpawn(params.commandLine,params.args,params.options)
    const result : SpawnResult = {
      stdout: null,
      status: null,
      error: null,
    }
    if (spawned.stdout) {
      spawned.stdout.on('data', (data) => {
        if (isNil(result.stdout)) {
          result.stdout = data
        } else {
          result.stdout += data
        }
      })
    }
    spawned.on('close', (code) => {
      result.status = code
      resolve(result)
    })
    spawned.on('error', (err) => {
      result.error = err
      resolve(result)
    })
  })
}

export default{
  run,
  spawn
}