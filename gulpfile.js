var gulp        = require('gulp'),
    util        = require('gulp-util'),
    through2    = require('through2'),
    browserify  = require('browserify'),
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    minifyCss   = require('gulp-minify-css'),
    sourcemaps  = require('gulp-sourcemaps'),
    rev         = require('gulp-rev'),
    clean       = require('gulp-clean'),
    plumber     = require('gulp-plumber'),
    rename      = require('gulp-rename');

var config = {
    assetsDir: 'src/AppBundle/Resources/',
    production: !!util.env.production
};

var bustCache = function() {
    return gulp.src(['web/css/build.css', 'web/js/build.js'], { base: 'web'} )
        .pipe(gulp.dest('web/'))
        .pipe(rev())
        .pipe(gulp.dest('web/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('app/Resources/assets/'));
}

gulp.task('scripts', function() {
    return gulp.src(config.assetsDir + 'scripts/index.js')
        .pipe(plumber())
        .pipe(through2.obj(function(file, enc, next) {
            browserify(file.path, { debug: true })
                .transform(require('babelify'))
                .transform(require('debowerify'))
                .bundle(function(err, res) {
                    if (err) {
                        return next(err);
                    }
                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end')
        })
        .pipe(config.production ? uglify() : util.noop())
        .pipe(rename('build.js'))
        .pipe(gulp.dest('web/js/'));
});

gulp.task('styles', function() {
    return gulp.src(config.assetsDir + 'styles/index.scss')
        .pipe(plumber())
        .pipe(!config.production ? sourcemaps.init() : util.noop())
        .pipe(sass().on('error', sass.logError))
        .pipe(!config.production ? sourcemaps.write() : util.noop())
        .pipe(config.production ? minifyCss() : util.noop())
        .pipe(rename('build.css'))
        .pipe(gulp.dest('web/css/'));
});

gulp.task('clean', function() {
    return gulp.src(['app/Resources/assets/rev-manifest.json', 'web/js/**/*', 'web/css/**/*'])
        .pipe(clean());
});

gulp.task('watch', ['clean', 'scripts', 'styles'], function() {
    gulp.watch(config.assetsDir + 'scripts/**/*.js', ['scripts']);
    gulp.watch(config.assetsDir + 'styles/**/*.scss', ['styles']);
});

gulp.task('default', ['clean', 'scripts', 'styles'], function() {
    config.production ? bustCache() : util.noop();
});
