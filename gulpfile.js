var gulp = require('gulp'), // Сообственно Gulp JS
	clean = require('gulp-clean'),
	gulpSequence = require('gulp-sequence'), //task by task
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    csso = require('gulp-csso'), // Минификация CSS
    sass = require('gulp-sass'), // Конвертация SASS (SCSS) в CSS
	prefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename');
	babel = require('gulp-babel');

var srcPath = './src/';
var targetPath = './dist/';
var path = targetPath;
gulp.task('css', function () { 
	gulp.src([
		srcPath+'lure.scss'
	])
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefixer())
		.pipe(csso())
	    .pipe(sourcemaps.write())
		.pipe(gulp.dest(path));
});

gulp.task('img', function () {
    gulp.src([
		'src/img/**/*',
	])
	.pipe(gulp.dest(path+'img/'))
});
gulp.task('core', function() {
    gulp.src([
				srcPath+'lure.core.js',
        ])
		.pipe(gulp.dest(path))	
		.pipe(sourcemaps.init())  
    
		.pipe(babel({
            presets: ['es2017','es2016','es2015'],
        }))
		.pipe(uglify()) // получившуюся "портянку" минифицируем
		.pipe(concat('lure.core.min.js')) // склеиваем все JS
		.pipe(sourcemaps.write('.'))        
        .pipe(gulp.dest(path)) // результат пишем по указанному адресу
});
gulp.task('content', function() {
    gulp.src([
				srcPath+'lure.content.js',
        ])
		.pipe(gulp.dest(path))
		.pipe(sourcemaps.init())      
		.pipe(babel({
            presets: ['es2017','es2016','es2015'],
        }))
		.pipe(uglify())
		.pipe(concat('lure.content.min.js'))
		.pipe(sourcemaps.write('.'))        
        .pipe(gulp.dest(path))
});
gulp.task('chart', function() {
    gulp.src([
				srcPath+'lure.chart.js',
        ])
		.pipe(gulp.dest(path))
		.pipe(sourcemaps.init())      
		.pipe(babel({
            presets: ['es2017','es2016','es2015'],
        }))
		.pipe(uglify()) 
		.pipe(concat('lure.chart.min.js'))
		.pipe(sourcemaps.write('.'))        
        .pipe(gulp.dest(path))
});
gulp.task('all', function() {
    gulp.src([
				srcPath+'lure.core.js',
				srcPath+'lure.content.js',
				//srcPath+'lure.basic.js',
				srcPath+'lure.chart.js',
        ])
		.pipe(sourcemaps.init())
		.pipe(concat('lure.all.js'))
		.pipe(gulp.dest(path))		
		.pipe(babel({
            presets: ['es2017','es2016','es2015'],
        }))
		.pipe(uglify())
		.pipe(rename('lure.all.min.js'))
		//.pipe(concat('lure.all.min.js'))
		.pipe(sourcemaps.write('.'))        
        .pipe(gulp.dest(path))
});
gulp.task('code', 
	gulpSequence(
    'all',
    'core',
    'content',
    'chart'));
	
gulp.task('build', 
	gulpSequence(
//	'clean',
	'css',
    'img',
    'code'));

gulp.task('watch', function () {
	gulp.watch('./src/*.scss', ['css']); 
	gulp.watch('./src/*.js', ['code']);
});