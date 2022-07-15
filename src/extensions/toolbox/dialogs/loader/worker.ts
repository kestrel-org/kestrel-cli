import {ChildProcess, spawn, SpawnOptions} from 'node:child_process';
import {Options} from 'ora';
import path from 'path';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


class Loader {
    worker? : ChildProcess
    /**
     * Start the loader
     *
     * @param loaderOptions Ora loader Options
    */
    start(loaderOptions : Options = {}){
        const options : SpawnOptions = {
            stdio: ['inherit', 'inherit', 'inherit','ipc']
        };
        const loaderPath = path.join(__dirname,'loader.js')
        this.worker = spawn('node',[loaderPath,JSON.stringify(loaderOptions)],options);
        
    }
    /**
     * Stop the loader, change it to a green `✔`
    */
    succeed(){
        return new Promise<void>((resolve,reject)=>{
            if(!this.worker)
                reject()
            this.worker?.on("message",(m)=>{
                this.worker = undefined
                resolve()
            })
            this.worker?.send("succeed")
        })
    }
    /**
     * Stop the loader, change it to a green `✖`
    */
    fail(){
        return new Promise<void>((resolve,reject)=>{
            if(!this.worker)
                reject()
            this.worker?.on("message",(m)=>{
                this.worker = undefined
                resolve()
            })
            this.worker?.send("fail")
        })
    }
}

export default Loader