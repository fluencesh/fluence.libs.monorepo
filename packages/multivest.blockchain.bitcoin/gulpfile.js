const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');

const tsp = ts.createProject('tsconfig.json');
const index = ts.createProject({
    target: "es6",
    module: "commonjs"
});

gulp.task('build', ['typescript', 'index']);

gulp.task('typescript', () => {
    return gulp.src([
            'src/**/*.ts'
        ])
        .pipe(sm.init())
        .pipe(tsp())
        .pipe(sm.write('.'))
        .pipe(gulp.dest('./dist'));      
});

gulp.task('index', () => {
    return gulp.src([
            './index.ts'
        ])
        .pipe(index())
        .pipe(gulp.dest('./'));      
});