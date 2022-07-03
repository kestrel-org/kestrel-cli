const {
    strings : {upperFirst},
} = require('gluegun');

const path = require('path')

// Generate test file for the backend

async function generateTestFile(toolbox,props,file_path){
    let promise = new Promise(async (resolve, reject) => {
        const {
            prints : {infoLoader},
            template : {saveLog},
        } = toolbox;
        toolbox.loader = infoLoader('Generating test file')
        await saveLog.generate({
            template: `addRoute/${props.model ? 'tests' : 'tests.example'}.ejs`,
            target: `${file_path}`,
            props: props,
        })
        await toolbox.loader.succeed()
        resolve();
    });
    return promise;
}

// Update or creates the swagger file for the sawgger api

function generateSwaggerFile(toolbox,props,file_path){
    let promise = new Promise(async (resolve, reject) => {
        const {
            prints : {infoLoader},
            template : {saveLog},
        } = toolbox;
        
        toolbox.loader = infoLoader('Generating swagger file')
        await saveLog.generate({
            template: `swagger/swagger_model.js.ejs`,
            target: `${file_path}`,
            props: props,
        })
        await toolbox.loader.succeed()
        
        resolve();
    });
    return promise;
}

// Generate router file in the backend

async function generateRouterFile(toolbox,props,model,file_path){
    let promise = new Promise(async (resolve, reject) => {
        const {
            prints : {infoLoader},
            template : {saveLog},
        } = toolbox;
        toolbox.loader = infoLoader('Generating router file')
        await saveLog.generate({
          template: `addRoute/${model ? "crud" : "example"}.ejs`,
          target: `${file_path}`,
          props: props,
        })
        await toolbox.loader.succeed()
        resolve();
    });
    return promise;
}

// Generate service files in the frontend

async function generateServiceFiles(toolbox,props,model,{service_path,front_src,service_name}){
    let promise = new Promise(async (resolve, reject) => {
        const {
            prints : {infoLoader},
            template : {saveLog},
        } = toolbox;
        // Generate the properties to render the file from the template

        toolbox.loader = infoLoader('Generating service file')
        const properties_to_remove = [props.model_id,"createdAt","updatedAt"]

        props.model_name = upperFirst(model)
        props.service_name = upperFirst(service_name)+"Service"
        props.service_file_name = path.basename(`${service_path}.service.ts`).replace('.ts','')
        props.model_properties_post = props.model_properties.filter(property => !properties_to_remove.includes(property.fieldName));
        props.path_to_env = path.relative(path.dirname(`${service_path}.service.ts`),path.join(front_src,"environments/environment")).replace(/\\/g,"/")
        props.model_id_type = ["integer"].includes(props.model_id_type) ? "number" : props.model_id_type

        const service_files = ["service","service.spec"];
        let generators = []

        // Generate the service files

        generators = service_files.reduce((res, file) => {
            const generator = saveLog.generate({
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



module.exports = {
    generateTestFile,
    generateSwaggerFile,
    generateRouterFile,
    generateServiceFiles
}