import {Toolbox} from "@src/extensions/toolbox/toolbox.js"

export interface Command {
    name : string,
    aliases : readonly string[],
    description? : string,
    scope? : 'in' | 'out',
    needs? : ["frontend","backend"],
    options? : Array<{
        flags : string,
        description? : string,
        default? : string | boolean
    }>,
    arguments? : Array<{
        name : string,
        description? : string,
        default? : string | boolean
        required? : boolean
    }>
    run(toolbox : Toolbox,options : any,args : any) : void
    [key: string]: any,
}
export interface CommandsObject {
    [key: string]: Command,
}
