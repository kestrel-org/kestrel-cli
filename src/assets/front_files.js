const front_files = {
    toTransform: [
        {
            path: 'angular-node/frontend/',
            part : "frontend/",
            convert : true,
            filename : 'package.json',
            createPath : '',
            replace: [{
                this: "frontend",
                by: "<%= props.fname || 'frontend' %>"
            }]
        },
        {
            path:'angular-node/frontend/',
            part: 'frontend/',
            filename : '.gitignore',
            createPath: '',
            convert : true,
        },
    ]
}

module.exports = front_files