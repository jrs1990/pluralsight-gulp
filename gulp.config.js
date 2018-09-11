module.exports = function () {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var server = './src/server/';
    var temp = './.tmp/';
    var root = './';
    var report = './report/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];

    var config = {
        alljs : ['./src/**/*.js', './*.js'],
        build: './build/',
        client : client,
        css: temp + 'styles.css',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        html: clientApp + '**/.*html',
        htmlTemplates: client + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        less: client + 'styles/styles.less',
        report: report,
        root: root,
        server: server,
        temp: temp,
        bower: {
            json: require('./bower.json'),
            directory: 'bower_components/',
            ignorePath: '../..'
        },
        packages: [
            './package.json',
            './bower.json'
        ],
        defaultPort: 7203,
        nodeServer: server + 'app.js',
        broweserReloadDelay: 1000,

        /*
        OPTIMIZED FILE NAMES
         */
        optimized: {
            lib: 'lib.js',
            app: 'app.js'
        },

        /*Template Cache 
        */
       templateCache: {
           file: 'templates.js',
           options: {
               module: 'app.core',
               standAlone: false,
               root: 'app/' 
           }

       },

       /**
        * karma and testing settings
        */
       serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js'],
       specHelpers: [client + 'test-helper/*.js']

    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };

        return options;
    };
    
    config.karma = getKarmaOptions();
    
    return config;

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}                    
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }

 };