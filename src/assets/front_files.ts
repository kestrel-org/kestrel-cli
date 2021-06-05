const front_files = {
    part : "frontend/",
    toTransform: [{
        path: 'angular-node/frontend/',
        filename : 'package.json',
        createPath : '',
        replace: [{
            this: "frontend",
            by: "<%= props.fname || 'frontend' %>"
        }]
    }]
}

module.exports = front_files