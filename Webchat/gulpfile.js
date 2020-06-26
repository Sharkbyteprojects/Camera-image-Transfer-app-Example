const gulp = require('gulp');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const cleanCSS = require('gulp-clean-css');
const minify = require("gulp-babel-minify");
const htmlmin = require('gulp-htmlmin');

const name = ["server.js", "client.js", "index.js"];
let arr = [];
for (let namee of name) {
    arr.push(() => {
        return gulp.src('p/' + namee)
            .pipe(webpack({
                mode: "production",
                output: {
                    filename: namee
                }
            }))
            .pipe(babel({}))
            .pipe(minify({
                mangle: {
                    keepClassName: false
                }
            }))
            .pipe(gulp.dest('dist/p/'));
    });
}

function cp() {
    return gulp.src('*/*.xml').pipe(gulp.dest("dist/"));
}
function cph() {
    return gulp.src('*/*.html').pipe(htmlmin({ collapseWhitespace: true })).pipe(gulp.dest("dist/"));
}
function main() {
    return gulp.src('./app.js').pipe(gulp.dest("dist/"));
}
function svg() {
    return gulp.src("*/*.svg").pipe(imagemin([imagemin.svgo({
        plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
        ]
    })])).pipe(gulp.dest("dist/"));
}
function css() {
    return gulp.src("*/*.css")
        .pipe(cleanCSS({}))
        .pipe(gulp.dest("dist/"));
}
function clonep(){
    return gulp.src('./package.json').pipe(gulp.dest("dist/"));
}
const run = [cp, cph, gulp.series(...arr), main, svg, css, clonep];
exports.default = gulp.parallel(...run);