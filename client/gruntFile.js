// 'use strict';

// var
//   LIVERELOAD_PORT = 35729,
//   lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT }),
//   mountFolder = function( connect, dir ) {
//     return connect.static(require('path').resolve(dir));
//   };

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-html2js');
	// grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-open');

	// Default task.
	// grunt.registerTask('default', ['jshint','build','karma:unit']);
	grunt.registerTask('default', ['build']);
	// grunt.registerTask('default', ['build','karma:unit']);
	// grunt.registerTask('new', ['jshint','build','karma:unit','server']);
	// grunt.registerTask('build', ['clean','html2js','concat','recess:build','copy:assets']);
	grunt.registerTask('build', ['clean','html2js','concat','copy:assets']);
	grunt.registerTask('server', function() {
		grunt.task.run([
			// 'connect:livereload',
			'open:server',
			'watch'
		]);
	});
	grunt.registerTask('release', ['clean','html2js','uglify','jshint','karma:unit','concat:index', 'recess:min','copy:assets']);
	grunt.registerTask('test-watch', ['karma:watch']);

	// Print a timestamp (useful for when watching)
	grunt.registerTask('timestamp', function() {
		grunt.log.subhead(Date());
	});

	var karmaConfig = function(configFile, customOptions) {
		var options = { configFile: configFile, keepalive: true };
		var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
		return grunt.util._.extend(options, customOptions, travisOptions);
	};

	// Project configuration.
	grunt.initConfig({
		distdir: 'dist',
		pkg: grunt.file.readJSON('package.json'),
		banner:
		'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
			' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
		src: {
			// js: ['src/**/*.js', 'vendor/**/*.js'],
			js: ['src/**/*.js', 'vendor/directives/**/*.js'],
			jsTpl: ['<%= distdir %>/templates/**/*.js'],
			specs: ['test/**/*.spec.js'],
			scenarios: ['test/**/*.scenario.js'],
			html: ['src/index.html'],
			tpl: {
				app: ['src/app/**/*.tpl.html'],
				common: ['src/common/**/*.tpl.html'],
				vendor: ['vendor/directives/**/*.tpl.html', 'vendor/directives/**/*.tmpl.html']
			},
			less: ['src/less/main.less'], // recess:build doesn't accept ** in its file patterns
			// less: ['src/less/stylesheet.less'], // recess:build doesn't accept ** in its file patterns
			// less: ['src/less/*.less', 'vendor/bootstrapcss/*.css'], // recess:build doesn't accept ** in its file patterns
			// less: ['vendor/bootstrapcss/*.css'], // recess:build doesn't accept ** in its file patterns
			lessWatch: ['src/less/**/*.less', 'vendor/bootstrap/**/*.less', 'src/less/**/*.css', 'vendor/bootstrap/**/*.css'],
			dbresource: ['vendor/mongolab/*.js'],
			angularui: ['vendor/angular-ui/bootstrap/*.js']
		},
		clean: ['<%= distdir %>/*'],
		copy: {
			assets: {
				files: [{ dest: '<%= distdir %>', src : '**', expand: true, cwd: 'src/assets/' }]
			}
		},
		karma: {
			unit: { options: karmaConfig('test/config/unit.js') },
			watch: { options: karmaConfig('test/config/unit.js', { singleRun:false, autoWatch: true}) }
			// unit: { options: karmaConfig('test/config/unitnew.js') },
			// watch: { options: karmaConfig('test/config/unitnew.js', { singleRun:false, autoWatch: true}) }
			// unit: {
			// 	configFile: 'test/config/unitnew.js',
			// 	options: {
			// 		singleRun:false,
			// 		autoWatch: true
			// 	}
			// }

		},
		html2js: {
			app: {
				options: {
					base: 'src/app'
				},
				src: ['<%= src.tpl.app %>'],
				dest: '<%= distdir %>/templates/app.js',
				module: 'templates.app'
			},
			common: {
				options: {
					base: 'src/common'
				},
				src: ['<%= src.tpl.common %>'],
				dest: '<%= distdir %>/templates/common.js',
				module: 'templates.common'
			},
			vendor: {
				options: {
					base: 'vendor'
				},
				src: ['<%= src.tpl.vendor %>'],
				dest: '<%= distdir %>/templates/vendor.js',
				module: 'templates.vendor'
			}
		},
		concat:{
			dist:{
				options: {
					banner: "<%= banner %>"
				},
				src:['<%= src.js %>', '<%= src.jsTpl %>'],
				dest:'<%= distdir %>/<%= pkg.name %>.js'
			},
			index: {
				src: ['src/index.html'],
				dest: '<%= distdir %>/index.html',
				options: {
					process: true
				}
			},
			angular: {
				src:['vendor/angular/angular.js', 'vendor/angular/angular-route.js'],
				dest: '<%= distdir %>/angular.js'
			},
			// angularmock: {
			//   src:['test/vendor/angular/angular-mocks.js'],
			//   dest: '<%= distdir %>/angular-mocks.js'
			// },
			mongo: {
				src:['vendor/mongolab/*.js'],
				dest: '<%= distdir %>/mongolab.js'
			},
			bootstrap: {
				src:['vendor/angular-ui/bootstrap/*.js'],
				dest: '<%= distdir %>/bootstrap.js'
			},
			jquery: {
				src:['vendor/jquery/*.js'],
				dest: '<%= distdir %>/jquery.js'
			},
			jqueryui: {
				src:['vendor/jquery-ui/*.js'],
				dest: '<%= distdir %>/jquery-ui.js'
			},

			// Unserscore
			underscore: {
				src:['vendor/underscore/underscore.js'],
				dest: '<%= distdir %>/underscore.js'
			},
			// angularunderscore: {
			//   src:['vendor/angular-underscore/angular-underscore.js'],
			//   dest: '<%= distdir %>/angular-underscore.js'
			// }
			angularunderscoremodule: {
				src:['vendor/angular-underscore-module/angular-underscore-module.js'],
				dest: '<%= distdir %>/angular-underscore-module.js'
			},

			bootstrapcss: {
				src:['vendor/bootstrap/dist/css/bootstrap.css', 'vendor/bootstrap/dist/css/bootstrap-theme.css', 'src/less/custom-utilities.less'],
				dest: '<%= distdir %>/<%= pkg.name %>.css'
			},

			// Moment
			moment: {
				src:['vendor/momentjs/moment.js'],
				dest: '<%= distdir %>/moment.js'
			},
			angularmoment: {
				src:['vendor/angular-moment/angular-moment.js'],
				dest: '<%= distdir %>/angular-moment.js'
			}
		},

		uglify: {
			dist:{
				options: {
					banner: "<%= banner %>"
				},
				src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
				dest:'<%= distdir %>/<%= pkg.name %>.js'
			},
			angular: {
				src:['<%= concat.angular.src %>'],
				dest: '<%= distdir %>/angular.js'
			},
			mongo: {
				src:['vendor/mongolab/*.js'],
				dest: '<%= distdir %>/mongolab.js'
			},
			bootstrap: {
				src:['vendor/angular-ui/bootstrap/*.js'],
				dest: '<%= distdir %>/bootstrap.js'
			},
			jquery: {
				src:['vendor/jquery/*.js'],
				dest: '<%= distdir %>/jquery.js'
			},
			jqueryui: {
				src:['vendor/jquery-ui/*.js'],
				dest: '<%= distdir %>/jquery-ui.js'
			},
			underscore: {
				src:['vendor/underscore/underscore.js'],
				dest: '<%= distdir %>/underscore.js'
			},
			// angularunderscore: {
			//   src:['vendor/angular-underscore/angular-underscore.js'],
			//   dest: '<%= distdir %>/angular-underscore.js'
			// }
			angularunderscoremodule: {
				src:['vendor/angular-underscore-module/angular-underscore-module.js'],
				dest: '<%= distdir %>/angular-underscore-module.js'
			},
			// Moment
			moment: {
				src:['vendor/momentjs/moment.js'],
				dest: '<%= distdir %>/moment.js'
			},
			angularmoment: {
				src:['vendor/angular-moment/angular-moment.js'],
				dest: '<%= distdir %>/angular-moment.js'
			}

		},
		recess: {
		  build: {
		    files: {
		      '<%= distdir %>/<%= pkg.name %>.css':
		      ['<%= src.less %>'] },
		    options: {
		      compile: true
		    }
		  },
		  min: {
		    files: {
		      '<%= distdir %>/<%= pkg.name %>.css': ['<%= src.less %>']
		    },
		    options: {
		      compress: true
		    }
		  }
		},

		// connect: {
		//   options: {
		//     port: 3000,
		//     hostname: '0.0.0.0'
		//     // base: './dist'
		//     // keepalive: true,
		//     // livereload: true
		//   },
		//   livereload: {
		//     options: {
		//       middleware: function( connect ) {
		//         return [
		//           lrSnippet,
		//           mountFolder(connect, './dist')
		//         ];
		//       }
		//     }
		//   }
		// },

		open: {
			server: {
				// url: 'http://localhost:<%= connect.options.port %>'
				url: 'http://localhost:3000/'
			}
		},

		// connect: {
		//   all: {
		//     options:{
		//       port: 3000,
		//       hostname: '0.0.0.0',
		//       base: 'app',
		//       keepalive: true,
		//       livereload: true
		//     }
		//   }
		// },
		// open: {
		//   all: {
		//     path: 'http://localhost:<%= connect.all.options.port%>'
		//   }
		// },

		watch:{
			// options: {
			//   livereload: true
			// },
			// livereload: {
			//   files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
			//   tasks:['default','timestamp'],
			//   // files: [
			//   //   '{,*/}*.html',
			//   //   'static/{,*/}*.{css,js,png,jpg,gif,svg}'
			//   // ],
			//   // tasks: ['jshint'],
			//   options: {
			//     livereload: LIVERELOAD_PORT
			//   }
			// },
			all: {
				files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>', '<%= src.dbresource %>', '<%= src.angularui %>'],
				tasks:['default','timestamp']
			},
			build: {
				files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>', '<%= src.dbresource %>', '<%= src.angularui %>'],
				tasks:['build','timestamp']
			}
		},

		jshint:{
			files:['gruntFile.js', '<%= src.js %>', '<%= src.jsTpl %>', '<%= src.specs %>', '<%= src.scenarios %>'],
			options:{
				curly:true,
				eqeqeq:true,
				immed:true,
				latedef:true,
				newcap:true,
				noarg:true,
				sub:true,
				boss:true,
				eqnull:true,
				globals:{}
			}
		}
	});
};
