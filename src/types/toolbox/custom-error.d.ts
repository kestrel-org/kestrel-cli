import { ExecException } from "node:child_process"
import { NullLiteral } from "typescript"

export type StringOrBuffer = string | Buffer
interface KestrelError extends ExecException{
    stdout? : StringOrBuffer,
    stderr? : StringOrBuffer
}
export type KcError = KestrelError | null