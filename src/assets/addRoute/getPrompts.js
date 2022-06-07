// Returns questions to prompt the user with

function getPrompts(toolbox, def_content, router_name, models, paths) {
    const {
        filesystem : {exists},
        prints : {error},
        strings : {upperFirst},
        path
    } = toolbox

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
        },
    ];

    const testFile = [
        {
            type: 'toggle',
            name: 'createTest',
            message: 'Create a test file ?',
            initial: false,
            active: 'yes',
            inactive: 'no'
        },
        {
            type: (prev, values, prompt) => {
                if(prev){
                    if(exists(path.join(paths.backend_path,"tests",`${router_name}.spec.js`))){
                        return "toggle";
                    }   
                }
                return null;
            },
            name: 'testOverwrite',
            message: (prev, values) => {
                const errorMsg = error('A test file already exist with this name !')
                return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
            },
            initial: false,
            active: 'yes',
            inactive: 'no'
        }
    ]
    
    const serviceFile = [
        {
            type: () => {
                if(def_content.projects.frontend_path){
                    return "toggle"
                }
                return null
            },
            name: 'createService',
            message: 'Create the associated service ?',
            initial: false,
            active: 'yes',
            inactive: 'no'
        },
        {
            type: async (prev, values, prompt) => {
                if(values.createService){
                    const service_found = await toolbox.filesystem.findAsync(paths.services_path,{matching : [`${paths.service_name}.service.ts`,`${paths.service_name}.service.spec.ts`]})
                    if(service_found.length > 0){
                        return 'toggle';
                    }  
                }
                return null;
            },
            name: 'serviceOverwrite',
            message: (prev, values) => {
                const errorMsg = error(`A service named ${paths.service_name} already exists !`)
                return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
            },
            initial: false,
            active: 'yes',
            inactive: 'no'
        }
    ]
    
    const swaggerFile = [
        {
            type: (prev, values, prompt) => {
                if(exists(path.join(paths.src,"routes/swaggerModels",upperFirst(values.model)+".js"))){
                    return "toggle";
                }   
                return null;
            },
            name: 'swaggerOverwrite',
            message: (prev, values) => {
                const errorMsg = error('A swagger definition already exist for this model !')
                return `${errorMsg === undefined ? '' : errorMsg}Overwrite ?`
            },
            initial: false,
            active: 'yes',
            inactive: 'no'
        }
    ]
    questions.push(...testFile,...serviceFile,...swaggerFile)
    

    return questions;
}

module.exports = getPrompts