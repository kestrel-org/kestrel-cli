const fileWatcher = require('./watchForFiles');
const updateFileSystem = require('./updateFileSystem')

class SaveFiles {
    classAlias = false;

    proxyHandle = {
        main : this,
        apply : async function (target, scope, args) {
            if(!args.slice(-1).pop().target){
                const isDbCommand = this.main.isDbCommand()
                const watcher = fileWatcher(scope.toolbox)
                watcher
                .on('all', (event,path) => {
                    switch(event){
                        case 'change':{
                            if(!isDbCommand)
                                updateFileSystem(scope.toolbox,path,'UPDATE')
                        }
                        break;
                        case 'add': {
                            if(!isDbCommand){
                                updateFileSystem(scope.toolbox,path,'CREATE') 
                                return;
                            }
                            const cjsPath = path.replace(".js",".cjs")
                            if(scope.toolbox.filesystem.exists(cjsPath))
                                updateFileSystem(scope.toolbox,path,'UPDATE',true)
                            else
                                updateFileSystem(scope.toolbox,path,'CREATE',true)
                        }
                        break;
                    }
                })
                const results = await target.bind(this.main)(...args);
                
                await watcher.close()
               
                return results;
              
            }
            const dir = args.slice(-1).pop().target.replace(/$(\/)*/g, '')
            const overwrite = await scope.toolbox.filesystem.existsAsync(dir)

            let action = "CREATE"

            const providedAction = args.slice(-1).pop().action
            if(providedAction!==null){
                action = providedAction ? "UPDATE" : action
            }
            else if(overwrite){
                action = "UPDATE"
            }
        
            // here we bind method with our class by accessing reference to instance
            const results = await target.bind(this.main)(...args);
            
            updateFileSystem(scope.toolbox,dir,action)
            
            return results;
        }
    }

    constructor(toolbox) {
        // Get all methods of choosen class
        let methods = Object.getOwnPropertyNames( this.constructor.prototype );


        // Find and remove constructor as we don't need Proxy on it
        let consIndex = methods.indexOf('constructor');
        if ( consIndex > -1 ) methods.splice(consIndex, 1);

        this.toolbox = toolbox
        this.filesSize = null
        this.databaseCommands = ['initdb','database']

        // Replace all methods with Proxy methods
        methods.forEach( methodName => {
            this[methodName] = new Proxy( this[methodName], this.proxyHandle );
        });
        
    }
    isDbCommand(){
        return this.databaseCommands.includes(this.toolbox.command.name)
    }
}


module.exports = SaveFiles