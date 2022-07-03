const Ora = require('ora');
const loaderOptions = JSON.parse(process.argv[2])
const loader = new Ora(loaderOptions)
loader.start()

process.on('message', (m) => {
    switch(m){
        case 'succeed':{
            loader.succeed()
        }
        break;
        case 'fail':{
            loader.fail()
        }
        break;
    }
    process.send("done")
    process.exit(0)
});

process.on('SIGINT', async () => {});
