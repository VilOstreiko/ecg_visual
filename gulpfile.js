"use strict";
const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const babel = require("gulp-babel");
const server = require('browser-sync').create();

gulp.task("style", function () {
    gulp.src("./src/scss/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({
                browsers: [
                    "last 1 version",
                    "last 2 Chrome versions",
                    "last 2 Firefox versions",
                    "last 2 Opera versions",
                    "last 2 Edge versions"
                ]
            }),
            cssnano()
        ]))
        .pipe(gulp.dest("./src/css"))
});

gulp.task("babel-transpile", function () {
    gulp.src("./src/js/script.js")
        .pipe(plumber())
        .pipe(babel({
            "presets": ["env"]
        }))
        .pipe(gulp.dest("./dist/js"));
});

gulp.task('img', function () {
    gulp.src('./src/img/*')
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.svgo({plugins: [{removeViewBox: false}]}),
            pngquant()
        ])))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task("build", ["style", "babel-transpile", "img"], function () {
    gulp.src('./src/css/**/*')
        .pipe(gulp.dest('./dist/css'));

    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts'));

    gulp.src(['./src/js/**/*', '!./src/js/script.js'])
        .pipe(gulp.dest('./dist/js'));

    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task("serve", ["style", "babel-transpile"], function () {
    server.init({
        server: './src/',
        notify: false,
        open: true,
        ui: false,
        ghostMode: false
    });

    gulp.watch("./src/scss/**/*.{scss,sass}", ["style"]);
    gulp.watch("./src/js/script.js", ["babel-transpile"]);
    gulp.watch('./src/**/*.html').on('change', server.reload);
    gulp.watch('./src/scss/**/*.scss').on('change', server.reload);
});
