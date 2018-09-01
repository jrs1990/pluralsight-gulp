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
            .pipe($.less())
            .pipe($.autoprefixer()) 
            .pipe(gulp.dest(config.temp));

});

gulp.task('clean-styles',function(done){
    var files = config.temp + '**/*.css';
    clean(files, done);
});

function clean(path,done){
    log('cleaning path '+ $.util.colors.red(path));
    del(path, done);

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