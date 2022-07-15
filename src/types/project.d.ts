export interface cliFile {
    projects: {
        backend_path? : string,
        frontend_path? : string
    },
    version : string
}
export default interface Project {
    project_def? : string | null,
    def_content? : cliFile,
    backend_path? : string,
    frontend_path? : string
}

