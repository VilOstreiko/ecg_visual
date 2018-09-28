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
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const server = require('browser-sync').create();

gulp.task("style", function () {
    return gulp.src("./src/scss/style.scss")
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
        .pipe(gulp.dest("./dist/css"))
});

gulp.task("babel-transpile", function () {
    return gulp.src("./src/js/*.js")
        .pipe(plumber())
        .pipe(babel({
            "presets": ["env"]
        }))
        .pipe(gulp.dest("./dist/js/"));
});

gulp.task('clean', function () {
    return gulp.src('./dist', { read: false })
        .pipe(clean());
});

gulp.task('img', function () {
    return gulp.src('./src/img/*')
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
            pngquant()
        ])))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task("pre-build", function (cb) {
    runSequence("clean",
        ["style", "babel-transpile", "img"],
        cb);
});

gulp.task("build", ["pre-build"], function () {
    gulp.src('./src/css/**/*')
        .pipe(gulp.dest('./dist/css'));

    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts'));

    gulp.src(['./src/js/lib/*'])
        .pipe(gulp.dest('./dist/js/lib'));

    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task("serve", ["build"], function () {
    server.init({
        server: './src/',
        notify: false,
        open: true,
        ui: false,
        ghostMode: false
    });

    gulp.watch("./src/scss/**/*.{scss,sass}", ["style"]);
    gulp.watch("./src/js/*.js", ["babel-transpile", server.reload]);
    gulp.watch('./src/**/*.html').on('change', server.reload);
    gulp.watch('./src/scss/**/*.scss').on('change', server.reload);
});
