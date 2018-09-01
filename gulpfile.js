var gulp  =require('gulp');
// var jshint = require('gulp-jshint');
// var jscs = require('gulp-jscs');
// var util = require('gulp-util');
 var print = require('gulp-print').default;
// var gulpif = require('gulp-if');
var args = require('yargs').argv;

var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy:true});


gulp.task('vet', function () {
    log('analisando');
    gulp.src(config.alljs)
        .pipe($.if(args.jander, print()) )
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish',{verbose: true}))
        .pipe($.jshint.reporter('fail'));
  });

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