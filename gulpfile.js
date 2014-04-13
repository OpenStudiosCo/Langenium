var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	supervisor = require('gulp-supervisor'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

gulp.task('libs', function() {
	return gulp.src('app/libs.js')
		.pipe(browserify({
			shim: {
				jquery: {
					path: './node_modules/jquery/dist/jquery',
					exports: '$'
				},
				handlebars: {
					path: './app/vendor/handlebars-1.1.2.js',
					exports: 'Handlebars'
				},
				ember: {
					path: './app/vendor/ember-1.5.0.js',
					exports: 'Ember',
					depends: {
						handlebars: 'Handlebars',
						jquery: '$'
					}
				},
				emberdata: {
					path: './app/vendor/ember-data.js',
					exports: 'EmberData',
					depends: {
						handlebars: 'Handlebars',
						jquery: '$',
						ember: 'Ember'
					}
				},
				three: {
					path: './node_modules/three/three.js',
					exports: 'THREE'
				},
				orbitcontrols: {
					path: './node_modules/three/examples/js/controls/OrbitControls.js',
					exports: 'OrbitControls',
					depends: {
						three: 'THREE'
					}
				}
			}
		}))
		//.pipe(uglify())
		.pipe(gulp.dest('./public/scripts'))
});

gulp.task('client', function() {
	return gulp.src('app/client.js')
		.pipe(browserify())
		//.pipe(uglify())
		.pipe(gulp.dest('./public/scripts'))
});

gulp.task('supervisor', function() {
	supervisor('server.js');
	return 1;
});

gulp.task('default', function() {
	gulp.start('libs');
	gulp.start('client');
	gulp.start('supervisor');
	watch({glob: 'app/*.js'}, function(files){
		gulp.start('libs');
		gulp.start('client');	
	});
});
