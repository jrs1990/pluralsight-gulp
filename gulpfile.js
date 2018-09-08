var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var del = require('del');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy:true});
var port = process.env.port || config.defaultPort;

gulp.task('help', $.taskListing);

gulp.task('default',['help']);

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
gulp.task('images',['clean-images'], function() {
    log('copying our images!');
    return gulp.src(config.images)
            .pipe($.imagemin({optimizationLevel: 4}))
            .pipe(gulp.dest(config.build + 'images'));
    
});

gulp.task('fonts',['clean-fonts'], function() {
    log('copying our fonts!');
    return gulp.src(config.fonts)
            .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('clean-styles',function(done) {
    log('cleaning styles!');
    var files = config.temp + '**/*.css';
    clean(files,done);
});

gulp.task('clean-fonts',function(done) {
    log('cleaning fonts!');
    var files = config.build + 'fonts/**/*.*';
    clean(files,done);
});

gulp.task('clean-images',function(done) {
    var files = config.build + 'images/**/*.*';
    clean(files,done);
});

gulp.task('clean-code',function(done) {
    var files = [].concat(
                            config.temp + '**/*.js',
                            config.build + '**/*.html',
                            config.build + 'js/**/*.js'
                        );
    clean(files,done);
});

gulp.task('clean',function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});


gulp.task('templatecache',['clean-code'], function() {
    log('creating AngularJS $templateCache');
    return gulp
            .src(config.htmlTemplates)
            .pipe($.minifyHtml({empty: true}))
            .pipe($.angularTemplatecache(
                                config.templateCache.file,
                                config.templateCache.options
                                ))
            .pipe(gulp.dest(config.temp));

});

gulp.task('optimize',['inject','fonts','images'], function() {
    log('optimizing the javascript, css and html!');
  
  var assets = $.useref.assets({searchPath: './'});
  var templatecache = config.temp + config.templateCache.file;
   var cssFilter = $.filter('**/*.css');
   var jsLibFilter = $.filter('**/' + config.optimized.app);
   var jsAppFilter = $.filter('**/' + config.optimized.lib);

    log('templatecache: ' + templatecache);
    log('config.optimized.app: ' + config.optimized.app);
    log('config.optimized.lib: ' + config.optimized.lib);

    return gulp
            .src(config.index)
            .pipe($.plumber())
            .pipe($.inject(
                gulp.src(templatecache, {read: false}), {
                starttag: '<!-- inject:templates:js -->'
            }))
            .pipe(assets)
            .pipe(cssFilter)
            .pipe($.csso())
            .pipe(cssFilter.restore())
            .pipe(jsLibFilter)
            .pipe($.uglify())
            .pipe(jsLibFilter.restore())
            .pipe(jsAppFilter)
            .pipe($.ngAnnotate())
            .pipe($.uglify())
            .pipe(jsAppFilter.restore())
            .pipe($.rev())
            .pipe(assets.restore())
            .pipe($.useref())
            .pipe($.revReplace())
            .pipe(gulp.dest(config.build))
            .pipe($.rev.manifest())
            .pipe(gulp.dest(config.build));
});

gulp.task('bump', function() {
    var msg = "Bumping version";
    var type = args.type;
    var version = args.version;
    var options = {};

    if(version) {
        options.version = version;
        msg += ' to ' + version;
    }
    else {
        options.type = type;
        msg += ' for a ' + type;
    } 
    log(msg);

    return gulp
            .src(config.packages)
            .pipe($.print())
            .pipe($.bump(options))
            .pipe(gulp.dest(config.root));
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
    log('config.js: ' + config.js);
    return gulp
                .src(config.index)
                .pipe(wiredep(options))
                .pipe($.inject(gulp.src(config.js)))
                .pipe(gulp.dest(config.client));
});

gulp.task('inject',['wiredep','styles','templatecache'],function() {
    log('wire up the app css into the html file and call wiredep');

    return gulp
               .src(config.index)
               .pipe($.inject(gulp.src(config.css)))
               .pipe(gulp.dest(config.client));
});

function serve(isDev) {

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
        .on('restart', function(env) {
             log('**** nodemon restared');
             log('files changed on restart:\n' + env);
             setTimeout(function() {
                browserSync.notify('reloading now ....');
                browserSync.reload({stream: false});
             }, config.browserReloadDelay);
        })
        .on('start',function(ev) {
            log('nodemon started!');
            startBroweserSync(isDev);
        })
        .on('crash', function() {
            log('**** nodemon crashed: script crashed for some reson');
         })
        .on('exit', function() {
            log('**** nodemon exited cleanly');
         });

}
gulp.task('serve-build',['optimize'], function() {
    serve(false);
});

gulp.task('serve-dev',['optimize'], function() {
    serve(true);
});

function clean(path,done) {
    log('cleaning path ' + $.util.colors.red(path));
    del(path,done);
}

function changeEvent(event){
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File: '+event.path.replace(srcPattern,'') + ' ' + event.type);
}

function startBroweserSync(isDev) {
    if (args.nosync || browserSync.active) {
        return;
    }
    log('Starting browserSync ' + port);

    if (isDev) {
        gulp.watch([config.less],['styles'])
        .on('change', function(event){
            changeEvent(event);
        });
    }
    else {
        gulp.watch([config.less, config.js, config.html],['optimize', browserSync.reload])
        .on('change', function(event){
            changeEvent(event);
        });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
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

    browserSync(options);
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
