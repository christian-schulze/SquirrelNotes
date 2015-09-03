const gulp = require('gulp');
const del = require('del');
const changed = require('gulp-changed');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const babel = require("gulp-babel");
const cjsx = require('gulp-cjsx');
const react = require('gulp-react');
const coffee = require('gulp-coffee');
const less = require('gulp-less');
const install = require('gulp-install');
const ChildProcess = require('child_process');
const Q = require('q');
const packageInfo = require('./package.json');


const BASE = 'src';
const DEST = 'app';


const babelOptions = {
  whitelist: [
    'react',
    'es6.arrowFunctions',
    'es6.destructuring',
    'es6.parameters',
    'es6.spread',
    'es6.modules',
    'runtime'
  ]
};


gulp.task('default', function() {

});

gulp.task('clean', function(cb) {
  return del([DEST], cb);
});

gulp.task('package', function(cb) {
  var exec = Q.nbind(ChildProcess.exec);

  var versionCommand = 'npm view electron-prebuilt version';
  return exec(versionCommand)
    .catch(function(err) {
      console.log('Error finding "electron-prebuilt" version\n' + err);
      cb(err);
    })
    .then(function(results) {
      var version = results[0].slice(0, -1);
      var command = [
        '$(npm bin)/electron-packager',
        DEST,
        packageInfo.name,
        '--platform=darwin',
        '--arch=x64',
        '--version=' + version,
        '--out=packages',
        '--icon=' + DEST + '/images/app-icon.icns',
        '--prune',
        '--overwrite'
      ].join(' ');

      console.log('Executing: ' + command);
      return exec(command);
    })
    .catch(function(err) {
      console.log('Error packaging Electron application\n' + err);
      cb(err);
    })
    .then(function(results) {
      console.log(results[1]);
    })
    .done();
});

/******************************************************************************
BUILD TASKS
******************************************************************************/

gulp.task('build', ['clean'], function() {
  return gulp.start(
    'build:html',
    'build:images',
    'build:cjsx',
    'build:jsx',
    'build:coffee',
    'build:js',
    'build:less',
    'build:vendor',
    'build:node_modules');
});

gulp.task('build:html', function() {
  return gulp.src([BASE + '/html/**/*.html'], { base: BASE })
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST));
});

gulp.task('build:images', function() {
  return gulp.src([
      BASE + '/images/**/*.png',
      BASE + '/images/**/*.jpg',
      BASE + '/images/**/*.gif',
      BASE + '/images/**/*.icns'
    ], {
      base: BASE
    })
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST));
});

gulp.task('build:cjsx', function() {
  return gulp.src([
      BASE + '/**/*.cjsx'
    ], {
      base: BASE
    })
    .pipe(plumber())
    .pipe(cjsx())
    .pipe(gulp.dest(DEST));
});

gulp.task('build:jsx', function() {
  return gulp.src([
      BASE + '/js/**/*.jsx'
    ], {
      base: BASE
    })
    .pipe(plumber())
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(DEST));
});

gulp.task('build:coffee', function() {
  return gulp.src([
      BASE + '/**/*.coffee',
      '!' + BASE + '/vendor/**',
      '!' + BASE + '/node_modules/**'
    ], {
      base: BASE
    })
    .pipe(plumber())
    .pipe(coffee())
    .pipe(gulp.dest(DEST));
});

gulp.task('build:js', function() {
  return gulp.src([
      BASE + '/**/*.js',
      '!' + BASE + '/vendor/**',
      '!' + BASE + '/node_modules/**'
    ], {
      base: BASE
    })
    .pipe(changed(DEST))
    .pipe(plumber())
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(DEST));
});

gulp.task('build:less', function() {
  return gulp.src([
      BASE + '/css/**/*.less'
    ], {
      base: BASE
    })
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest(DEST));
});

gulp.task('build:vendor', function() {
  return gulp.src([
      BASE + '/vendor/**'
    ], {
      base: BASE
    })
    .pipe(gulp.dest(DEST));
});

gulp.task('build:node_modules', function() {
  return gulp.src([
      'package.json'
    ])
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST))
    .pipe(install({ production: true }));
});

/******************************************************************************
WATCH TASKS
******************************************************************************/

gulp.task('watch', function() {
  return gulp.start(
    'watch:html',
    'watch:images',
    'watch:cjsx',
    'watch:jsx',
    'watch:coffee',
    'watch:js',
    'watch:less',
    'watch:vendor',
    'watch:node_modules');
});

gulp.task('watch:html', function() {
  watch(BASE + '/html/**/*.html', batch(function(events, done) {
    gulp.start('build:html');
    done();
  }));
});

gulp.task('watch:images', function() {
  watch([
    BASE + '/images/**/*.png',
    BASE + '/images/**/*.jpg',
    BASE + '/images/**/*.gif',
    BASE + '/images/**/*.icns'
  ], batch(function(events, done) {
    gulp.start('build:images');
    done();
  }));
});

gulp.task('watch:cjsx', function() {
  watch(BASE + '/js/**/*.cjsx', batch(function(events, done) {
    gulp.start('build:cjsx');
    done();
  }));
});

gulp.task('watch:jsx', function() {
  watch(BASE + '/js/**/*.jsx', batch(function(events, done) {
    gulp.start('build:jsx');
    done();
  }));
});

gulp.task('watch:coffee', function() {
  watch([
    BASE + '/**/*.coffee',
    '!' + BASE + '/vendor/**',
    '!' + BASE + '/node_modules/**'
  ], batch(function(events, done) {
    gulp.start('build:coffee');
    done();
  }));
});

gulp.task('watch:js', function() {
  watch([
    BASE + '/**/*.js',
    '!' + BASE + '/vendor/**',
    '!' + BASE + '/node_modules/**'
  ], batch(function(events, done) {
    gulp.start('build:js');
    done();
  }));
});

gulp.task('watch:less', function() {
  watch(BASE + '/css/**/*.less', batch(function(events, done) {
    gulp.start('build:less');
    done();
  }));
});

gulp.task('watch:vendor', function() {
  watch(BASE + '/vendor/**', batch(function(events, done) {
    gulp.start('build:vendor');
    done();
  }));
});

gulp.task('watch:node_modules', function() {
  watch('package.json', batch(function(events, done) {
    gulp.start('build:node_modules');
    done();
  }));
});

