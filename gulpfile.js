var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	supervisor = require('gulp-supervisor'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

gulp.task('libs', function() {
    gulp.src('client/libs.js')
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

gulp.task('client', function() {
    gulp.src('client/client.js')
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'))
});

gulp.task('supervisor', function() {
	supervisor('server.js');
	return 1;
});

gulp.task('default', function() {
	gulp.start('libs');
	gulp.start('client');
	gulp.start('supervisor');
	watch({glob: 'client/*.js'}, function(files){
		gulp.start('client');	
	});
});
