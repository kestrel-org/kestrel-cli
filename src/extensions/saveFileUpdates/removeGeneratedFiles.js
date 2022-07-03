const {
    filesystem : {exists,removeAsync},
} = require('gluegun');
const path = require('path');

async function asyncremoveGeneratedFiles(files) {
    if(files.new){
        await removeAsync(files.new)
    }
}
module.exports =  findProjectDefinition