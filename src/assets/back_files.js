const back_files = {
    toTransform: [{
            path: 'angular-node/backend/',
            part: 'backend/',
            filename: 'package.json',
            convert: true,
            createPath: '',
            replace: [{
                this: "backend",
                by: "<%= props.bname || 'backend' %>"
            }]
        }
    ]
}


module.exports = back_files