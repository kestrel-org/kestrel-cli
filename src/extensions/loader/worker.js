const spawn = require('child_process').spawn ;
const path = require('path')


class Loader {
    constructor(loaderOptions){
        this.worker = null
        this.loaderOptions = loaderOptions
    }
    start(){
        const options = {
            stdio: ['inherit', 'inherit', 'inherit','ipc']
        };
        const loaderPath = path.join(__dirname,'loader.js')
        this.worker = new spawn('node',[loaderPath,JSON.stringify(this.loaderOptions)],options);
        
    }
    succeed(){
        return new Promise((resolve,reject)=>{
            this.worker.on("message",(m)=>{
                resolve()
            })
            this.worker.send("succeed")
        })
    }
    fail(){
        return new Promise((resolve,reject)=>{
            this.worker.on("message",(m)=>{
                resolve()
            })
            this.worker.send("fail")
        })
    }
}

module.exports = Loader