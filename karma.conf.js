module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'main.js',
            './parser.spec.js'
        ],
        exclude: [
        ],
        browsers: [/*"PhantomJS"*/ "Chrome"],
        reporters: ["spec"]
    })
}