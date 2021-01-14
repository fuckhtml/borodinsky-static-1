const browserSync = require("browser-sync").create()
const del = require("del")

const gulp = require("gulp")
const glob = require("gulp-sass-glob")
const plumber = require("gulp-plumber")

const posthtml = require("gulp-posthtml")
const include = require("posthtml-include")

const sass = require("gulp-sass")
const sourcemaps = require("gulp-sourcemaps")

const changed = require("gulp-changed")
const imagemin = require("gulp-imagemin")

// --

const clean = () => {
  return del("./build/")
}
exports.clean = clean

const fonts = () => {
  return gulp.src("./source/fonts/*.{woff,woff2}")
    .pipe(changed("./build/fonts"))
    .pipe(gulp.dest("./build/fonts"))
}

const images = () => {
  return gulp.src([
    "./source/img/**/*.*"
  ], {
    base: "./source/img"
  })
    .pipe(changed("./build/img"))
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 95, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(gulp.dest("./build/img"))
}

const html = () => {
  return gulp.src("./source/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("./build"))
}

const scss = () => {
  return gulp.src("./source/scss/main.scss")
    .pipe(plumber())

    .pipe(sourcemaps.init())
    .pipe(glob())
    .pipe(sass())
    .pipe(sourcemaps.write())

    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream())
}

const sync = () => {
  browserSync.init({
    server: {
        baseDir: "./build",
        proxy: "localhost.dev"
    }
  })

  browserSync.watch("./source/img/**/*.*", images)
  browserSync.watch("./source/scss/**/*.scss", scss)
  browserSync.watch("./source/*.html", html)
  browserSync.watch("./source/*.html").on("change", browserSync.reload)
}

// --

// final project building
exports.build = gulp.series(
  clean,
  gulp.parallel(fonts, images, html, scss)
);

// development
exports.default = gulp.series(
  // gulp.parallel(fonts, images, html, scss),
  gulp.series(scss, sync)
)
