const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');
const cl = require('gulp-clean');
const lint = require('gulp-tslint');

const tsp = ts.createProject('tsconfig.json');

gulp.task('build', () => 
    gulp.src([
            'src/**/*.ts'
        ])
        .pipe(sm.init())
        .pipe(tsp())
        .pipe(sm.write('.'))
        .pipe(gulp.dest('./dist'))
);

gulp.task('clean', () => 
        gulp.src([
            './dist/*',
            './node_modules/web3/*.d.ts'
        ])
        .pipe(cl())
);
