var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src(['browserify-bundles/client-libs.js'])
        .pipe(browserify({
        	shim: {
        		jquery: {
        			path: './node_modules/jquery/dist/jquery.js',
        			exports: '$'
        		},
        		three: {
        			path: './node_modules/three/three.js',
        			exports: 'THREE'
        		}
        	}
        }))
        .pipe(uglify())
        .pipe(watch())
        .pipe(gulp.dest('./public/js'))
});

gulp.task('default', function() {
	gulp.run('scripts');
});
