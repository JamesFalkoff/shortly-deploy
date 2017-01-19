module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      client: {
        src: ['public/client/*.js'],
        dest: 'public/dist/allFiles.js'
      },
      lib: {
        src: ['public/lib/jquery.js', 'public/lib/underscore.js', 'public/lib/backbone.js', 'public/lib/handlebars.js'],
        dest: 'public/dist/allLibs.js'       
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      javascript: {
        files: {
          'public/dist/allLibs.min.js': ['public/dist/allLibs.js'],
          'public/dist/allFiles.min.js': ['public/dist/allFiles.js']
        }        
      }
    },

    eslint: {
      options: { 
        quiet: true
      },
      target: [
        '**/*.js'
      ]
    },

    cssmin: {
      target: {
        files: {
          'public/dist/style.min.css': ['public/style.css'],
        }        
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push live master'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);
  
  grunt.registerTask('lint', [
    'eslint'
  ]);

  grunt.registerTask('build', ['concat', 'uglify', 'cssmin']);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy-local', ['lint', 'test', 'build', 'nodemon']);

  grunt.registerTask('deploy-prod', ['lint', 'test', 'build', 'shell']);
  
  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run([ 'deploy-prod' ]); 
    } else {
      grunt.task.run([ 'deploy-local' ]);
    }
  });

  grunt.registerTask('default', ['nodemon']);
  // ['nodemon']
};
