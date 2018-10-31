const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');
const cl = require('gulp-clean');

const tsp = ts.createProject('tsconfig.json');

gulp.task('build', () =>
  gulp.src([
    './src/**/*.ts',
    './index.ts'
  ], {base: './'})
    .pipe(sm.init())
    .pipe(tsp())
    .pipe(sm.write('.'))
    .pipe(gulp.dest('./dist'))
);

gulp.task('clean', () =>
  gulp.src([
    './dist/*'
  ])
    .pipe(cl())
);
