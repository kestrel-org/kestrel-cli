import {ExecOptions, SpawnOptions} from 'node:child_process';

export interface RunOptions extends ExecOptions{
    trim? : boolean
}
export interface RunResult {
    stdout: null,
    error: Error | null
}

export interface SpawnOpts extends SpawnOptions{
    trim? : boolean
}
export interface SpawnResult {
    stdout: null,
    status: number | null,
    error: Error | null
}