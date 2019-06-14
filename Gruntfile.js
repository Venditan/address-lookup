module.exports = function (grunt) {

    var config = {};

    var obj_js_files = [
        './src/jquery.venditan-places.js'
    ];

    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
        config: config,
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            dev : {
                options : {
                    sourceMap : true,
                    flatten: false
                },
                files : [{
                    flatten: false,
                    src: obj_js_files,
                    dest: './dist/jquery.venditan-places.min.js'
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['release']);
    grunt.registerTask('release', [
        'uglify',
    ]);
};