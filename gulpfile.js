var gulp  =require('gulp');
// var jshint = require('gulp-jshint');
// var jscs = require('gulp-jscs');
// var util = require('gulp-util');
 var print = require('gulp-print').default;
// var gulpif = require('gulp-if');
var args = require('yargs').argv;

var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy:true});
var del = require('del'); 


gulp.task('vet', function () {
    log('analisando');
    gulp.src(config.alljs)
        .pipe($.if(args.jander, print()) )
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish',{verbose: true}))
        .pipe($.jshint.reporter('fail'));
  });

gulp.task('styles',['clean-styles'], function () {  
    log('compile less -> css');
    return gulp
            .src(config.less)
           // .pipe($.plumber())
            .pipe($.less())
            .on('error', errorLogger)
            .pipe($.autoprefixer()) 
            .pipe(gulp.dest(config.temp));

});

function errorLogger(error){
    log('inicio do erro');
    log(error);
    log('final do erro');
    this.emit('end');
}

gulp.task('clean-styles',function(){
    var files = config.temp + '**/*.css';
    clean(files);
});

gulp.task('less-watcher', function () { 
    gulp.watch([config.less],['styles']);
 });

 gulp.task('wiredep',function(){
     log('wire up the bower css e js and our ap into the html');
     var options = config.getWiredepDefaultOptions();
     var wiredep = require('wiredep').stream;
     return gulp
                .src(config.index)
                .pipe(wiredep(options))
                .pipe($.inject(gulp.src(config.js)))
                .pipe(gulp.dest(config.client));
 });

 gulp.task('inject',['wiredep','styles'],function(){
    log('');

    return gulp
               .src(config.index)
               .pipe($.inject(gulp.src(config.css)))
               .pipe(gulp.dest(config.client));
});

function clean(path){
    log('cleaning path '+ $.util.colors.red(path));
    del(path);

}

  function log(msg){
    if (typeof(msg) === 'object')
    {
        for(var item in msg){
            if(msg.hasOwnProperty(item))
            {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }
    else{
        $.util.log($.util.colors.blue(msg));
    }
  }