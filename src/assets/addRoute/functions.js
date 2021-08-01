const {
    strings : {singular, upperFirst, lowerCase}
} = require('gluegun');

const swagger_convert = {
    number : [
        "DOUBLE",
        "TINYINT",
        "FLOAT",
        "BIGINT",
        "DECIMAL",
        "REAL"
    ],
    string : [
        "VARCHAR",
        "DATE",
        "DATEONLY",
        "CITEXT",
        "TEXT",
        "CHAR",
        "STRING"
    ],
    boolean : [
        "BOOLEAN"
    ],
    integer : [
        "INTEGER"
    ]
}
// Returns a particular sequelize model as a usable object

function getSequelizeModel(model,database) {
    return database.sequelize.models[model];
}

// Returns all the available models in the project

function getAllModels(database) {
    let models = [];
    for(let model in database.sequelize.models){
        models.push({
            title: upperFirst(model),
            value: model
        });
    }
    return models;
}

// Returns questions to prompt the user with

function getPrompts(router_name, models) {
    let questions = [{
            type: 'toggle',
            name: 'checkToken',
            message: 'Token verification support ?',
            initial: false,
            active: 'yes',
            inactive: 'no'
        },
        {
            type: 'toggle',
            name: 'checkAuthenticated',
            message: 'Check if the user is authenticated ?',
            initial: false,
            active: 'yes',
            inactive: 'no'
        },
        {
            type: 'text',
            name: 'path',
            initial: router_name.split('/').pop(),
            message: `Path ?`
        },
        {
            type: 'select',
            name: 'model',
            message: 'Use a model ?',
            choices: models,
            initial: 0
        }
    ];
    return questions;
}

// Returns the properties needed to populate the template

function buildTemplateProperties(model, database, path=null, path_to_model=null) {

    // Initialize properties to build the template with

    let props = {
        path_to_model : path_to_model,
        path : path,
        model : null,
        model_def : null,
        model_single : null,
        model_id : null,
        model_properties : []
    }
    
    // If a model is selected add more properties to the props object

    if (model) {
        const model_obj = getSequelizeModel(model,database);
        let attrs = model_obj['tableAttributes'];
        let model_id = model_obj['primaryKeyAttribute'];
        for (let attr_name in attrs) {
            let type = convertSequelizeToSwaggerTypes(attrs[attr_name].type.key)
            if(attrs[attr_name].fieldName == model_id){
                props.model_id_type = type
            }
            props.model_properties.push(
                {
                    type : type,
                    fieldName : attrs[attr_name].fieldName
                }
            )
        }
        props.model = model;
        props.model_single = singular(model);
        props.model_id = model_id;
        props.model_def = upperFirst(singular(model));
    }

    return props;
}

// Update or creates the swagger file for the sawgger api

function generateSwaggerFile(toolbox,props,file_path){
    let promise = new Promise(async (resolve, reject) => {
        const {
            prints : {chalk,info,error},
            filesystem : {exists},
            template : {generate},
            prompts
        } = toolbox;
        let overwrite = true;
        if(exists(file_path)){
            error(`A swagger definition already exist for this model !`)
            const ow = await prompts.confirm("Overwrite ?")
            if(!ow){
                overwrite = false;
            }
        }   
        if(overwrite){
            toolbox.loader = info(chalk.blue.bold('Generating swagger file'),true)
            await generate({
                template: `swagger/swagger_model.js.ejs`,
                target: `${file_path}`,
                props: props,
            })
            toolbox.loader.succeed()
        }
        resolve();
    });
    return promise;
}

// Update or create routes

function updateRoutes(routes,router_name,responses){
    let update;
    responses.router = router_name
    const new_routes = routes.map(route => {
        if(route.router == router_name ){
            update = true;
            route = responses
        }
        return route;
    })
    if(!update){
        new_routes.push(responses)
    } 
    return {new_routes,update}
}

// Transform sequelize data types into sawgger data types

function convertSequelizeToSwaggerTypes(type){
    let regex_type = type.match(/^.*?(?=( |\(|\.|$))/);
    if(regex_type.length<2){
        throw new Error(`${type} could not be identified as a sequelize data type !`);
    }
    regex_type = regex_type[0];
    let found = false;
    for(let swagger_type in swagger_convert){
        if(swagger_convert[swagger_type].includes(regex_type)){
            type = swagger_type;
            found=true;
            break;
        }
    }
    if(!found){
        type = "string";
    }
    return type
}


module.exports = {
    getAllModels,
    getSequelizeModel,
    getPrompts,
    buildTemplateProperties,
    updateRoutes,
    generateSwaggerFile
}