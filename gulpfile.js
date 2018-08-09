
/*-----------------------  Variáveis  ----------------------*/
const gulp = require('gulp');
const express = require('express');
const spritesmith = require('gulp.spritesmith');
const inlinesource = require('gulp-inline-source');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const htmlReplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');
const minify = require('minify');
const gulpif = require('gulp-if');
const zip = require('gulp-zip');
const browserSync = require('browser-sync');
const csslint = require('gulp-csslint');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const inject = require('gulp-inject');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const gulpSequence = require('gulp-sequence');
const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const merge = require('merge-stream');

/*-----------------------  Default  ----------------------*/

/* Tarefa padrão */

gulp.task('default', ['clean'], function(){
    gulp.start(gulpSequence('spritesmith', 'sass', 'copycss', 'copysprite', 'copyfavicon', 'inlinesource', 'minify-html', 'express') );
});

/* Clean */
gulp.task('clean', function() {
    return gulp.src(['dist', 'src/imgmin', 'src/sprite'])
        .pipe(clean() );
});

/*---------------------- Copias --------------------------*/

gulp.task('copy',  function() {
    gulp.start('copycss', 'copysprite', 'copyfavicon');
});

gulp.task('copyfavicon', function() {
    return gulp.src('src/imgmin/favicon.jpg')
        .pipe(gulp.dest('dist/img') );
});

gulp.task('copysprite', function() {
    return gulp.src('src/sprite/*.png')
        .pipe(gulp.dest('dist/sprite') );
});

gulp.task('copycss', function() {
    return gulp.src('src/css/*.css')
        .pipe(gulp.dest('dist/css') );
});

/*-----------------------  Imagem  ----------------------*/

/* Spritesmith*/
gulp.task('spritesmith',['build-img'], function () {
    var spriteData = gulp.src('src/imgmin/*.png').pipe(spritesmith({
        imgName: '../sprite/sprite.png',
        cssName: 'sprite.scss',
        padding: 40
    }));
    var imgStream = spriteData.img.pipe(gulp.dest('src/sprite'));
    var cssStream = spriteData.css.pipe(gulpif('*.scss', gulp.dest('src/sass/sprites')) );
    return merge(imgStream, cssStream);
});

/* Minificação de imagens */
gulp.task('build-img', function() {
    return gulp.src('src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('src/imgmin'));
});;

/*-----------------------  CSS  ----------------------*/

/* Gerando css minificado com Sass */
gulp.task('sass', function(){
    return gulp.src('./src/sass/**/site.scss')
        .pipe(sass()).on('error', sass.logError)
        .pipe(cssmin())
        .pipe(gulp.dest('./src/css'))
});

/* Concatenação e minificação CSS */
gulp.task('merge-css', function() {
    gulp.src(['dist/css/normalize.min.css',
        'dist/css/bootstrap.min.css',
        'dist/css/global.css',
        'dist/css/video.css',
        'dist/css/section.css',
        'dist/css/footer.css'])
        .pipe(concat('site.min.css') )
        .pipe(cleanCSS() )
        .pipe(gulp.dest('dist/css') );
});

/*---------------  JavaScript  --------------*/

/* Concatenação e minificação Js */
gulp.task('merge-js', function() {
    return gulp.src(['dist/js/jquery-3.3.1.min.js',
        'dist/js/global.js'])
        .pipe(concat('script.js'))
        .pipe(gulp.dest('dist/js'));
});

/*-------------------  HTML  ------------------*/

/* Minify HTML */
gulp.task('minify-html', function() {
    gulp.src('dist/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

/* inlinesource */
gulp.task('inlinesource', function () {
    return gulp.src('./src/*.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
});

gulp.task('html-replace', function() {
    return gulp.src('dist/**/*.html')
        .pipe(inject( gulp.src('dist/css/**/sprite.css', {read: false})) )
        .pipe(htmlReplace( {css:'css/site.min.css'}) )
        .pipe(gulp.dest('dist') );
});

/*----------------- Servidor ------------------*/

gulp.task('express', function(){
    var app = express();
    app.use(express.static(__dirname + '/dist/'));
    app.listen(process.env.PORT || 5000);
});

/*-------------------  Dev  -------------------*/

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: 'src'
        }
    });

    gulp.watch('src/**/*').on('change', browserSync.reload);

    gulp.watch('src/css/**/*.css').on('change', function(event) {
        gulp.src(event.path)
            .pipe(csslint())
            .pipe(csslint.formatter());
    });

    gulp.watch('src/js/**/*.js').on('change', function(event) {

        gulp.src(event.path)
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish));
    });

});

gulp.task('zip', function(){
    gulp.src('dist/**/*')
        .pipe(zip('projeto.zip'))
        .pipe(gulp.dest('dist'))
});