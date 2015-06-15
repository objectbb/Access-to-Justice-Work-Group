/*
 * grunt-cli
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Tyler Kellen, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-init/blob/master/LICENSE-MIT
 */
'use strict';
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        watch: {
            scripts: {
               files: ['./js/**/*.js','./js/**/*.html'],             
                tasks: ['concat', 'uglify', 'cssmin'],
                options: {
                    spawn: false,
                },
            },
        },
        cssmin: {
            target: {
                files: [{
                    './dist/taxidriver.min.css': ['./dist/*.css']
                }]
            }
        },
        jshint: {
            all: ['./js/app/*/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                node: true
            }
        },
        concat: {
            lib: {
                src: ['./js/libs/jquery-2.1.4.min.js', './js/libs/jquery.highlight.js', './js/libs/angular.min.js', './js/libs/angular-animate.min.js', './js/libs/ui-bootstrap-tpls-0.13.0.min.js', './js/libs/bootstrap-select.min.js', './js/libs/bootstrap.min.js', './js/libs/angular.rangeSlider.js', './js/libs/angular.rangeSlider.js', './js/libs/lodash.min.js', './js/libs/maplace-0.1.3.min.js', './js/libs/angular-leaflet-directive.min.js', './js/libs/jquery.dataTables.min.js', './js/libs/isteven-multi-select.js', './js/libs/breeze.min.js', './js/libs/breeze.bridge.angular.js', './js/libs/breeze.metadata-helper.js'],
                dest: './dist/taxidriver.lib.js'
            },
            app: {
                src: ['./js/app/main/app.js', './js/app/filters/defaultfilter.js', './js/app/services/dabreezee.js', './js/app/main/services/mongo/reports.js', './js/app/directives/tableinfo.js', './js/app/main/controller/app.js', './js/app/map/controller/map.js'],
                dest: './dist/taxidriver.app.js'
            },
            css: {
                src: ['./css/*.css'],
                dest: './dist/taxidriver.css'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    './dist/taxidriver.lib.min.js': ['./dist/taxidriver.lib.js'],
                    './dist/taxidriver.app.min.js': ['./dist/taxidriver.app.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // "npm test" runs these tasks
    grunt.registerTask('wtf', ['concat']);
    grunt.registerTask('minime', ['concat', 'uglify', 'cssmin']);
};