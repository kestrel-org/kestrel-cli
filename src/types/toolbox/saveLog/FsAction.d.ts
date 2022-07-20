export type FsAction = "CREATE" | "UPDATE"
export interface FileSystemUpdate {
    action : FsAction,
    path : string,
    size : number
}