const back_files = {
    part : 'backend/',
    toTransform: [{
        path: 'angular-node/backend/',
        filename : 'package.json',
        createPath : '',
        replace: [{
            this: "backend",
            by: "<%= props.bname || 'backend' %>"
        }]
    }]
}


module.exports = back_files