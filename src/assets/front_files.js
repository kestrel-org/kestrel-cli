const front_files = {
    toTransform: [{
        path: 'angular-node/frontend/',
        part : "frontend/",
        convert : true,
        filename : 'package.json',
        createPath : '',
        replace: [{
            this: "frontend",
            by: "<%= props.fname || 'frontend' %>"
        }]
    }]
}

module.exports = front_files