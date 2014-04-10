var gulp = require('gulp');

var browserify = require('gulp-browserify');

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
        .pipe(gulp.dest('./public/js'))
});

gulp.task('default', function() {
	gulp.run('scripts');
});
