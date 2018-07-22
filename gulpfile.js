const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const htmlReplace = require('gulp-html-replace');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const browserSync = require('browser-sync');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const csslint = require('gulp-csslint');
const zip = require('gulp-zip');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const spritesmith = require('gulp.spritesmith');
const inlinesource = require('gulp-inline-source');
const htmlmin = require('gulp-htmlmin');
const gulpSequence = require('gulp-sequence');
const express = require('express');
const app = express();



gulp.task('express', function(){
    app.use(express.static(__dirname + '/app/'));
    app.listen(process.env.PORT || 5000);
    console.log('node is running');
});

// app.get('/', function (req, res) {
//     res.render('app/index');
// });
//
// app.listen(app.get('port'), function (){
//     console.log('node is running', app.get('port'));
// });



/*--------------Alias--------------*/
 gulp.task('default', gulpSequence('clean', 'spritesmith', 'sass', 'copycss', 'copysprite', 'copyfavicon', 'inlinesource', 'minify'));

/*------------------  Tarefa Padrão  ---------------------*/

gulp.task('copyfavicon', function() {
    return gulp.src('src/imgmin/favicon.jpg')
        .pipe(gulp.dest('app/img') );
        // .pipe(gulp.src('src/sprite/sprite.png')).pipe(gulp.dest('app/sprite/'));
});

gulp.task('copysprite', function() {
    return gulp.src('src/sprite/*.png')
        .pipe(gulp.dest('app/sprite') );
        // .pipe(gulp.src('src/sprite/sprite.png')).pipe(gulp.dest('app/sprite/'));
});

gulp.task('copycss', function() {
    return gulp.src('src/css/*.css')
        .pipe(gulp.dest('app/css') );
        // .pipe(gulp.src('src/sprite/sprite.png')).pipe(gulp.dest('app/sprite/'));
});

gulp.task('clean', function() {
    return gulp.src(['app', 'src/imgmin', 'src/sprite'] )
        .pipe(clean());
});


/*-----------------------  Imagens  -----------------------*/

/* Sprite com css minificado*/
gulp.task('spritesmith',['build-img'], function () {
    var spriteData = gulp.src('src/imgmin/*.png').pipe(spritesmith({
        imgName: '../sprite/sprite.png',
        cssName: 'sprite.scss',
        padding: 40
    }));
    spriteData.img.pipe(gulp.dest('src/sprite'));
    spriteData.css.pipe(gulpif('*.scss', gulp.dest('src/sass/sprites')) );
});

/* Minificação de imagens */
gulp.task('build-img', function() {
    return gulp.src('src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('src/imgmin'));
});

/*-----------------------  CSS  ----------------------*/

/* Gerando css minificado com Sass */
gulp.task('sass', function(){
    return gulp.src('./src/sass/**/site.scss')
        .pipe(sass()).on('error', sass.logError)
        .pipe(cssmin())
        .pipe(gulp.dest('./src/css'))
});

/*---------------  JavaScript  --------------*/

/* Concatenação e minificação Js */
gulp.task('merge-js', function() {
    return gulp.src(['src/js/jquery-3.3.1.min.js',
        'src/js/jquery.mb.YTPlayer.js',
        'src/js/global.js'])
        .pipe(concat('script.js'))
        .pipe(gulp.dest('app/js'));$.sequence
        // .pipe(uglify())
});

/*-------------------  HTML  ------------------*/

gulp.task('html-replace', function() {
    return gulp.src('src/**/*.html')
        .pipe(htmlReplace({js: 'js/script.js'}) )
        .pipe(gulp.dest('app') );
});

gulp.task('inlinesource', function () {
    return gulp.src('./src/*.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./app'));
});

gulp.task('minify', function() {
    return gulp.src('app/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('app'));
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
    gulp.src('app/**/*')
        .pipe(zip('projeto.zip'))
        .pipe(gulp.dest('app'))
});