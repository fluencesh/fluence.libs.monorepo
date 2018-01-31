const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');
const cl = require('gulp-clean');
const lint = require('gulp-tslint');

const tsp = ts.createProject('./tsconfig.json');
const index = ts.createProject({
    target: "es6",
    module: "commonjs"
});

gulp.task('build', ['typescript', 'static']);

gulp.task('clean', () => {
    return gulp.src([
            './dist/*',
        ])
        .pipe(cl());      
});

gulp.task('typescript', () => {
    return gulp.src([
            'src/**/*.ts'
        ])
        .pipe(sm.init())
        .pipe(tsp())
        .pipe(sm.write('.'))
        .pipe(gulp.dest('./dist'));      
});

gulp.task('static', () => {
    return gulp.src([
            'src/abi/erc20.json'
        ])
        .pipe(gulp.dest('./dist/abi'));      
});

gulp.task('lint', () =>
    gulp.src([
            './src/**/*.ts'
        ])
        .pipe(lint({
            formatter: 'stylish'
        }))
        .pipe(lint.report())
);
