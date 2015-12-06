
var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    sourcemaps = require('gulp-sourcemaps'),
    watchify = require('watchify');

var sourceFilesPath = './extension/js';
var bundledFilesPath = './extension/js/bundled';

function bundle(sourceFile, dest) {
    browserify(sourceFilesPath + '/' + sourceFile)
        .bundle()
        .pipe(source(dest))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: false}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(bundledFilesPath));
}

gulp.task('build', function() {
    bundle('main.js', 'popup-bundled.js');
    bundle('background.js', 'background-bundled.js');
});

gulp.task('watch', function(cb) {

    watchify.args.debug = true;
    function watch(src, dst) {

        var bundler = watchify(browserify(watchify.args)).add(sourceFilesPath + '/' + src);
        
        function bundle() {
            console.log("Bundling " + dst);
            
            return bundler.bundle()
                .pipe(source(dst))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(bundledFilesPath));
        }

        bundler.on('update', bundle);
        
        return bundle;
    }

    watch('main.js', 'popup-bundled.js')();
    return watch('background.js', 'background-bundled.js')();
});
