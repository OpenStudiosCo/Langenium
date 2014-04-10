var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	supervisor = require('gulp-supervisor'),
	uglify = require('gulp-uglify');

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
        .pipe(gulp.dest('./public/js'))
});

gulp.task('supervisor', function() {
    supervisor('server.js', {
    	forceWatch: true
    });
});

gulp.task('default', function() {
	gulp.run('scripts');
	gulp.run('supervisor');
});
