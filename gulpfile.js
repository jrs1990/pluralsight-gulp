var gulp = require('gulp');
var args = require('yargs').argv;
var broweserSync = require('browser-sync');
var del = require('del');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy:true});
var port = process.env.port || config.defaultPort;

gulp.task('vet', function () {
    log('analisando');
    gulp.src(config.alljs)
        .pipe($.if(args.jander, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish',{verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles',['clean-styles'], function () {
    log('compile less -> css');
    return gulp
            .src(config.less)
            .pipe($.plumber())
            .pipe($.less())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles',function(done) {
    var files = config.temp + '**/*.css';
    clean(files,done);
});

gulp.task('less-watcher', function () {
    gulp.watch([config.less],['styles']);
});

gulp.task('wiredep', function() {
    log('wire up the bower css e js and our ap into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;
    return gulp
                .src(config.index)
                .pipe(wiredep(options))
                .pipe($.inject(gulp.src(config.js)))
                .pipe(gulp.dest(config.client));
});

gulp.task('inject',['wiredep','styles'],function() {
    log('');

    return gulp
               .src(config.index)
               .pipe($.inject(gulp.src(config.css)))
               .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev',['inject'], function() {
        var isDev = true;
        var nodeOptions = {
            script: config.nodeServer,
            delayTime:1,
            env:{
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.server]
        };
        return $.nodemon(nodeOptions)
              .on('start',function(ev) {
                log('nodemon started!');
                startBroweserSync();
            });
    });

function clean(path,done) {
    log('cleaning path ' + $.util.colors.red(path));
    del(path,done);
}

function startBroweserSync() {
    if (broweserSync.active) {
        return;
    }
    log('Starting broweser sync ' + port);

    var options = {
        proxy: 'localhost:' + port,
        port:3000,
        files: [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ],
        ghostMode:{
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };
}

function log(msg) {
    if (typeof(msg) === 'object')
    {
        for (var item in msg) {
            if (msg.hasOwnProperty(item))
            {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }
    else {
        $.util.log($.util.colors.blue(msg));
    }
}
