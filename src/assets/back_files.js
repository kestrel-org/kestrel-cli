const back_files = {
    toTransform: [
        {
            path: 'angular-node/backend/',
            part: 'backend/',
            filename: 'package.json',
            convert: true,
            createPath: '',
            replace: [{
                this: "backend",
                by: "<%= props.bname || 'backend' %>"
            }]
        },
        {
            path:'angular-node/backend/',
            part: 'backend/',
            filename : '.gitignore',
            createPath: '',
            convert : true,
        },
    ]
}


module.exports = back_files