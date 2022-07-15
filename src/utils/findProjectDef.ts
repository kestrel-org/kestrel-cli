
import path from 'path';
import { existsSync } from 'node:fs';

function findProjectDefinition(from : string) {
    const root = path.parse(from).root;
    let currentDir = from;
    while (currentDir && currentDir !== root) {
        const definition = path.join(currentDir, "kestrel-cli.json");
        if (existsSync(definition)) {
            return definition;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
export default findProjectDefinition