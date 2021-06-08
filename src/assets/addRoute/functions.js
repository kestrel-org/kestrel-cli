const {
    strings
} = require('gluegun');

// Returns a particular sequelize model as a usable object

function getSequelizeModel(model,database) {
    return database.sequelize.models[model];
}

// Returns all the available models in the project

function getAllModels(database) {
    let models = [];
    for(let model in database.sequelize.models){
        models.push({
            title: strings.upperFirst(model),
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

// Returns a completed template to create the router

function buildTemplateProperties(model, path, path_to_model, database) {

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
        let properties = [];
        let swagger_types = ["string", "integer"]
        for (let attr_name in attrs) {
            let type = strings.lowerCase(`${attrs[attr_name].type}`);
            if (!swagger_types.includes(type)) {
                type = 'string'
            }
            properties.push(
                {
                    type : type,
                    fieldName : attrs[attr_name].fieldName
                }
            )
        }
        const model_single = strings.singular(model)
        const model_def = strings.upperFirst(model_single);
        props.model = model;
        props.model_def = model_def;
        props.model_single = model_single;
        props.model_id = model_obj['primaryKeyAttribute'];
        props.model_properties = properties;
    }

    return props;
}

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



module.exports = {
    getAllModels,
    getSequelizeModel,
    getPrompts,
    buildTemplateProperties,
    updateRoutes
}