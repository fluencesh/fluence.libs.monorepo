const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');
const cl = require('gulp-clean');
const lint = require('gulp-tslint');

const tsp = ts.createProject('tsconfig.json');

gulp.task('build', ['typescript', 'static']);

gulp.task('typescript', () =>
    gulp.src([
            './src/**/*.ts',
            './index.ts'
        ], {base: './'})
        .pipe(sm.init())
        .pipe(tsp())
        .pipe(sm.write('.'))
        .pipe(gulp.dest('./dist'))
);

gulp.task('static', () => {
    return gulp.src([ 
            'src/abi/erc20.json'
        ]) 
        .pipe(gulp.dest('./dist/abi'));
});

gulp.task('clean', () =>
        gulp.src([
            './dist/*'
        ])
        .pipe(cl())
);
