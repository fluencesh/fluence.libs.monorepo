const gulp = require('gulp');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');

const tsp = ts.createProject('tsconfig.json');
const index = ts.createProject({
    target: "es6",
    module: "commonjs"
});

gulp.task('clean', () => {
    return gulp.src([
            './dist/*',
            './node_modules/web3/*.d.ts'
        ])
        .pipe(cl());      
});

gulp.task('build', () => {
    return gulp.src([
            'src/**/*.ts'
        ])
        .pipe(sm.init())
        .pipe(tsp())
        .pipe(sm.write('.'))
        .pipe(gulp.dest('./dist'));      
});