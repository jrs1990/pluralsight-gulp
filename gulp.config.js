module.exports = function () {
    var client = './src/client/';
    var clientApp = client + 'app';
    var server = './src/server/';
    var temp = './.tmp';

    var config = {
        alljs : ['./src/**/*.js','./*.js'],
        build: './build/',
        client : client,
        css: temp + 'styles.css',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js',
        ],
        less: client + 'styles/styles.less',
        server: server,
        temp: temp,
        bower: {
            json: require('./bower.json'),
            directory: '.bower_components/',
            ignorePath: '../..'
        },
        defaultPort: 7203,
        nodeServer: './src/server/app.js',
        broweserReloadDelay: 1000
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };

        return options;
    };



    return config;

 };