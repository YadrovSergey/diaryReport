var gulp = require('gulp'),
    $ = require('gulp-load-plugins')();

gulp.task('build', function() {
  return gulp.src('./src/diaryReport.js')
    .pipe($.plumber())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.umd({
      dependencies: function(file) {
          return [
            {
              name: 'fabric',
              amd: 'fabric',
              cjs: 'fabric',
              global: 'fabric',
              param: 'fabric'
            }
          ];
        }
    }))
    .pipe(gulp.dest('./lib'))
    .pipe($.uglify())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest('./lib'));
});

gulp.task('serve', function() {
  gulp.src('./')
    .pipe($.webserver({
      livereload: true,
      directoryListing: true
    }));
});

gulp.task('watch', function() {
  gulp.watch('./src/diaryReport.js', ['build']);
});

gulp.task('default', ['build', 'watch', 'serve']);