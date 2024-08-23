const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourseMaps = require('gulp-sourcemaps');
//const groupmedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');

gulp.task('html', function(){
    return gulp.src('./src/*.html')
    .pipe(changed('./dist/', {hasChanged: changed.compareContents}))
    .pipe(plumber({
        errorHandler: notify.onError({
            title: 'html',
            message: 'Error <%= error.message %>',
            sound: false
        })
    }))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('sass', function(){
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./dist/css/'))
        .pipe(plumber({
            errorHandler: notify.onError({
                title: 'styles',
                message: 'Error <%= error.message %>',
                sound: false
            })
        }))
        .pipe(sourseMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        //.pipe(groupmedia())
        .pipe(sourseMaps.write())
        .pipe(gulp.dest('./dist/css/'))
});

gulp.task('copyimg', function(){
    return gulp.src('./src/img/**/*', {encoding: false})
        .pipe(changed('./dist/img/', {encoding: false}))
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest('./dist/img/'))
});

gulp.task('fonts', function(){
    return gulp.src('./src/fonts/**/*')
        .pipe(changed('./dist/fonts/'))
        .pipe(gulp.dest('./dist/fonts/'))
});

gulp.task('js', function(){
    return gulp.src('./src/js/*.js')
    .pipe(changed('./dist/js/'))
    .pipe(plumber({
        errorHandler: notify.onError({
            title: 'js',
            message: 'Error <%= error.message %>',
            sound: false
        })
    }))
        .pipe(babel())
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/js/'))
});

gulp.task('server', function(){
    return gulp.src('./dist/')
        .pipe(server({
            livereload: true,
            open: true
        }))
});

gulp.task('clean', function(done){
    if(fs.existsSync('./dis/')) {
        return gulp.src('./dist/', {read: false})
        .pipe(clean({force: true}))
    }
    done();
});

gulp.task('watch', function(){
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./src/**/*.html', gulp.parallel('html'));
    gulp.watch('./src/img/**/*', gulp.parallel('copyimg'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js'));
});

gulp.task('st', gulp.series('clean',
    gulp.parallel('html', 'sass', 'copyimg', 'fonts', 'js'),
    gulp.parallel('server', 'watch')
));

