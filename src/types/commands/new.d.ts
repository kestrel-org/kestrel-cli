export interface NewProps {
    name : string,
    backend_path : string | null,
    frontend_path : string | null,
    bname? : string | null,
    fname? : string | null,
    kc_version : string
}

export interface FilesToTransform {
    toTransform : Array<{
        path : string,
        part : string,
        filename : string,
        convert: boolean,
        createPath : string,
        replace?: Array<{
            this : string,
            by : string
        }>
    }>
}