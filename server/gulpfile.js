"use strict";
let gulp = require('gulp');
let jsLibFiles = ['./node_modules/angular/angular.js','./node_modules/angular-cookies/angular-cookies.js'];
let jsLibOutFolder = './public/jsLib';

gulp.task('default',['copyJsLib'],function() {
  
});

gulp.task('copyJsLib', function() {
   return gulp
    .src(jsLibFiles)
    .pipe(gulp.dest(jsLibOutFolder));
});