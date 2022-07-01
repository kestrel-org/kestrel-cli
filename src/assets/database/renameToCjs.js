const asyncForEach = require('../../utils/asyncForEach')
async function renameDbFiles(toolbox){

    const {
        project : {
            backend_path
        },
        filesystem : {renameAsync,listAsync},
        path
    } = toolbox

    const modelsPath = path.join(backend_path,"src/models")
    const migrationsPath = path.join(backend_path,"src/migrations")
    const seedersPath = path.join(backend_path,"src/seeders")

    const [models,migrations,seeders] = await Promise.all([
        listAsync(modelsPath),
        listAsync(migrationsPath),
        listAsync(seedersPath)
    ])
    return await Promise.all([

        asyncForEach(models,async (file)=>{
            if(file==="index.js" || file.slice(-4)===".cjs") return;
            return await renameAsync(
                path.join(modelsPath,file),
                `${file.slice(0,file.lastIndexOf("."))}.cjs`,
                {overwrite : true}
            )
        }),

        asyncForEach(migrations,async (file)=>{
            if(file.slice(-4)===".cjs") return;
            return await renameAsync(
                path.join(migrationsPath,file),
                `${file.slice(0,file.lastIndexOf("."))}.cjs`,
                {overwrite : true}
            )
        }),

        asyncForEach(seeders,async (file)=>{
            if(file.slice(-4)===".cjs") return;
            return await renameAsync(
                path.join(seedersPath,file),
                `${file.slice(0,file.lastIndexOf("."))}.cjs`,
                {overwrite : true}
            )
        })
    ])
}
module.exports = renameDbFiles
    
    