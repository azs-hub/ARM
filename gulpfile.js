/**** DIRECTORIES ****/
var $app = "app",// environnement de dev
    $dist = "prod";// livrable

/**** VARIABLES ****/
var gulp = require("gulp"),
    sass = require("gulp-sass"),
    browserSync = require("browser-sync"),
    useref = require("gulp-useref"),
    uglify = require("gulp-uglify"),// minification JS
    imagemin = require("gulp-imagemin"),
    cache = require("gulp-cache"),
    del = require("del"),
    runSequence = require("run-sequence"),
    fileinclude = require("gulp-file-include"),
    notify = require("gulp-notify"),
    replace = require('gulp-replace'),
    symlink = require('gulp-symlink'),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("tsconfig.json"),
    babel = require('gulp-babel'),
    babelify = require('babelify'),
    browserify = require('browserify');
    
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('gulplog');
var sourcemaps = require('gulp-sourcemaps');

/****TASKS****/

// gulp.task("ts", function () {
//     return tsProject.src()
//         .pipe(tsProject())
//         .js.pipe(gulp.dest($dist + "/js"));
// });




gulp.task("browserSync", function () {
    browserSync({
        server: {
            baseDir: $dist
        }
    });
});

gulp.task("sass", function () {
    return gulp.src($app + "/public/scss/main.scss")
        .pipe(sass({outputStyle: "expanded"}))
        .pipe(gulp.dest($dist + "/css"))
        //.pipe(browserSync.reload) // {
        //     stream: true
        // }));
});

gulp.task("watch", ["fileinclude", "browserSync", "sass", 'es6'], function () {
    gulp.watch($app + "/public/scss/*.scss", ["sass", browserSync.reload]);
    gulp.watch($app + "/*.html", ["fileinclude"]);
    gulp.watch($app + "/public/js/**/*.js", ['es6']);
    // gulp.watch($app + "/public/js/**/*.ts", ["ts"]);
    // gulp.watch($app + "/public/partials/*.html", ["fileinclude"]);
    gulp.watch($dist + "/*.html", browserSync.reload);// on ne recharge que les preview
    gulp.watch($dist + "/css/**/*.css", browserSync.reload);
    gulp.watch($dist + "/js/**/*.js", browserSync.reload);
});

gulp.task("useref", function () {
    return gulp.src($dist + "/*.html")
        .pipe(useref())
        .pipe(gulp.dest($dist));
});

gulp.task("fonts", function () {
    return gulp.src($app + "/public/fonts/**/*")
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest($dist + "/fonts"));
});

gulp.task("img", function () {
    return gulp.src($app + "/public/images/**/*.+(png|jpg|jpeg|gif|svg)")
        .pipe(gulp.dest($dist + "/images"));
});

/*gulp.task("svg", function () {
    return gulp.src($app + "/public/svg/*.svg")
        .pipe(gulp.dest($dist + "/svg"));
});*/

gulp.task("js", function () {
    return gulp.src($app + "/public/js/**/*.js")
        .pipe(gulp.dest($dist + "/js"));
});

// gulp.task('es6', function(){
//     gulp.src($app + "/public/js/*.js")
//         .pipe(babel({"presets": ["es2015"]}))
//         .pipe(gulp.dest($dist + "/js"))
// });

gulp.task('es6', function(){
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: [
            "app/public/js/AnimGsap.js",
            "app/public/js/ArrowAnim.js",
            "app/public/js/LogoAnim.js",
            "app/public/js/WelcomeAnim.js",
            "app/public/js/main.js"],
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify.configure({
          presets: ['es2015']
        })]
    });

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest($dist + '/js/'));
});

gulp.task("css", function () {
    return gulp.src($app + "/public/css/*.css")
        .pipe(gulp.dest($dist + "/css"));
});

gulp.task("clean:dist", function (callback) {
    return del([$dist + "/**/*", "!" + $dist + "/img", "!" + $app + "/img/**/*"], callback);
});

gulp.task('replace-html-src', function () {
    return gulp.src([$app + "/index.html"])
        .pipe(replace('/prod/', ''))
        .pipe(gulp.dest($dist));
});

gulp.task("clean", function (callback) {
    del([$dist]);
    return cache.clearAll(callback);
});

gulp.task("fileinclude", function () {
    gulp.src([$app + "/**/*.html"])
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "@file"
        }))
        .pipe(gulp.dest("prod/"));
});


// gulp.task('symlink-matterJs', function () {
//     return gulp.src('./node_modules/matter-js')
//         .pipe(symlink("./app/prod/js/libs/matter-js"));
// });

// gulp.task('symlink-requireJS', function () {
//     return gulp.src('./node_modules/requirejs')
//         .pipe(symlink("./app/prod/js/libs/requirejs"));
// });

gulp.task("default", function (callback) {
    runSequence(["sass", "img", "fonts", "js", 'es6', "css", "fileinclude", "browserSync", "watch"], callback);
});
