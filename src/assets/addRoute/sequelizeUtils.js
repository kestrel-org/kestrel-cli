const {
    strings : {upperFirst}
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
            title: upperFirst(model),
            value: model
        });
    }
    return models;
}

module.exports = {
    getSequelizeModel,
    getAllModels
}