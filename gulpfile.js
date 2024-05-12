import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import svgo from 'gulp-svgmin';
import {deleteAsync} from 'del';
import browser from 'browser-sync';
import replace from 'gulp-replace';
import {stacksvg} from 'gulp-stacksvg';

export const processStyles = () => {
  return gulp.src('source/sass/style.scss', {sourcemaps: true})
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/css', {sourcemaps: '.'}))
    .pipe(browser.stream());
};

const processScripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

const processMarkup = () => {
  return gulp.src('source/*.html')
    .pipe(replace('.css', '.min.css'))
    .pipe(replace('.js', '.min.js'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
};

const optimizeRaster = () => {
  return gulp.src('source/images/**/*.{png,jpg}')
    .pipe(imagemin())
    .pipe(gulp.dest('build/images'));
};

const copyImages = () => {
  return gulp.src('source/images/**/*.{png,jpg}')
    .pipe(gulp.dest('build/images'));
};

const createWebp = () => {
  return gulp.src(['source/images/**/*.{png,jpg}', '!source/images/favicons/*.png'])
    .pipe(webp())
    .pipe(gulp.dest('build/images'));
};

const optimizeVector = () => {
  return gulp.src(['source/images/**/*.svg', '!source/images/sprites/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/images'));
};

const createStack = () => {
  return gulp.src('source/images/sprites/*.svg')
    .pipe(svgo())
    .pipe(stacksvg({output: 'sprite.svg'}))
    .pipe(gulp.dest('build/images'));
};

const copyFiles = (done) => {
  gulp.src([
    'source/fonts/**/*.woff2',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
  done();
};

const removeBuild = () => deleteAsync('build');

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const reloadServer = (done) => {
  browser.reload();
  done();
};

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(processStyles));
  gulp.watch('source/js/*.js', gulp.series(processScripts));
  gulp.watch('source/*.html', gulp.series(processMarkup, reloadServer));
  gulp.watch(
    'source/images/**/*.{png,jpg}',
    gulp.series(
      copyImages,
      createWebp,
      processMarkup,
      reloadServer,
    )
  );
  gulp.watch(
    'source/images/**/*.svg',
    gulp.series(
      optimizeVector,
      createStack,
      processMarkup,
      reloadServer,
    )
  );
};

export const build = gulp.series(
  removeBuild,
  copyFiles,
  optimizeRaster,
  gulp.parallel(
    processStyles,
    processMarkup,
    processScripts,
    optimizeVector,
    createStack,
    createWebp
  )
);

export default gulp.series(
  removeBuild,
  copyFiles,
  copyImages,
  gulp.parallel(
    processStyles,
    processMarkup,
    processScripts,
    optimizeVector,
    createStack,
    createWebp
  ),
  gulp.series(server, watcher)
);
