import toolbox from "@src/extensions/toolbox/toolbox.js";
import { AddProps, PathObject } from "@src/types/commands/addRoute";
const path = toolbox.path
const {
    print : {infoLoader,error},
    strings : {upperFirst},
    saveLog : {
        generate
    }
} = toolbox;

/**
 * Generate test file for the backend
 * @param props Props used for the test template
 * @param file_path Where to create the test
 * @returns Promise<void>
 */
async function generateTestFile(props : AddProps,file_path : string) : Promise<void>{
    let promise = new Promise<void>(async (resolve, reject) => {
        toolbox.loader.start(infoLoader('Generating test file'))
        await generate({
            template: `addRoute/${props.model ? 'tests' : 'tests.example'}.ejs`,
            target: `${file_path}`,
            props: props
        })
        await toolbox.loader.succeed()
        resolve();
    });
    return promise;
}

/**
 * Update or creates the swagger file for the sawgger api
 * @param props Props used for the swagger template
 * @param file_path Where to create the swagger file
 * @returns Promise<void>
 */
function generateSwaggerFile(props : AddProps,file_path : string) : Promise<void>{
    let promise = new Promise<void>(async (resolve, reject) => {
        
        toolbox.loader.start(infoLoader('Generating swagger file'))
        await generate({
            template: `swagger/swagger_model.js.ejs`,
            target: `${file_path}`,
            props: props,
        })
        await toolbox.loader.succeed()
        
        resolve();
    });
    return promise;
}

/**
 * Generate router file in the backend
 * @param props Props used for the router template
 * @param model Model used to create the router if any
 * @param file_path Where to create the router
 * @returns Promise<void>
 */
async function generateRouterFile(props : AddProps,model : string,file_path : string) : Promise<void>{
    let promise = new Promise<void>(async (resolve, reject) => {
        
        toolbox.loader.start(infoLoader('Generating router file'))
        await generate({
          template: `addRoute/${model ? "crud" : "example"}.ejs`,
          target: `${file_path}`,
          props: props,
        })
        await toolbox.loader.succeed()
        resolve();
    });
    return promise;
}

/**
 * Generate service files in the frontend
 * @param props Props used for the service template
 * @param model Model used to create the service if any
 * @param frontPaths Paths for the frontend project
 * @returns Promise<void>
 */
async function generateServiceFiles(props : AddProps,model : string,{service_path,front_src,service_name} : PathObject): Promise<void>{
    let promise = new Promise<void>(async (resolve, reject) => {
        
        // Generate the properties to render the file from the template

        toolbox.loader.start(infoLoader('Generating service file'))
        const properties_to_remove = [props.model_id,"createdAt","updatedAt"]

        props.model_name = upperFirst(model)
        props.service_name = upperFirst(service_name)+"Service"
        props.service_file_name = path.basename(`${service_path}.service.ts`).replace('.ts','')
        props.model_properties_post = props.model_properties.filter(property => !properties_to_remove.includes(property.fieldName));
        props.path_to_env = path.relative(path.dirname(`${service_path}.service.ts`),path.join(front_src,"environments/environment")).replace(/\\/g,"/")
        if(props.model_id_type)
            props.model_id_type = ["integer"].includes(props.model_id_type) ? "number" : props.model_id_type

        const service_files = ["service","service.spec"];
        let generators : Promise<any>[] = []

        // Generate the service files

        generators = service_files.reduce((res, file) => {
            const generator = generate({
                template: `addRoute/service/${model ? "crud" : "example"}.${file}.ejs`,
                target: `${service_path}.${file}.ts`,
                props: props,
            }).catch((err)=>{error(err);return undefined})
            return res.concat(generator)
        }, generators)
        await Promise.all(generators)
        await toolbox.loader.succeed()
        resolve();
    });
    return promise;
}



export default {
    generateTestFile,
    generateSwaggerFile,
    generateRouterFile,
    generateServiceFiles
}