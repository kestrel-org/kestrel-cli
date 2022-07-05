const {
    filesystem : {exists},
} = require('gluegun');
const path = require('path');

function findProjectDefinition(from) {
    const root = path.parse(from).root;
    let currentDir = from;
    while (currentDir && currentDir !== root) {
        const definition = path.join(currentDir, "kestrel-cli.json");
        if (exists(definition)) {
            return definition;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
module.exports =  findProjectDefinition