import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import del from 'del';
import browser from 'browser-sync';
import replace from 'gulp-replace';
import {stacksvg} from 'gulp-stacksvg';

export const styles = () => {
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

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

const html = () => {
  return gulp.src('source/*.html')
    .pipe(replace('.css', '.min.css'))
    .pipe(replace('.js', '.min.js'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
};

const optimizeImages = () => {
  return gulp.src('source/images/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/images'));
};

const copyImages = () => {
  return gulp.src('source/images/**/*.{png,jpg}')
    .pipe(gulp.dest('build/images'));
};

const createWebp = () => {
  return gulp.src(['source/images/**/*.{png,jpg}', '!source/images/favicons/*.png'])
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/images'));
};

const optimizeSvg = () => {
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

const copy = (done) => {
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

const clean = () =>  del('build');

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

const reload = (done) => {
  browser.reload();
  done();
};

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch(
    'source/images/**/*.{png,jpg}',
    gulp.series(
      copyImages,
      createWebp,
      styles,
      html,
      reload,
    )
  );
  gulp.watch(
    'source/images/**/*.svg',
    gulp.series(
      optimizeSvg,
      createStack,
      styles,
      html,
      reload,
    )
  );
};

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    optimizeSvg,
    createStack,
    createWebp
  )
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    optimizeSvg,
    createStack,
    createWebp
  ),
  gulp.series(server,watcher)
);
