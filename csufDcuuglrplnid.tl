[1mdiff --git a/.gitignore b/.gitignore[m
[1mindex 723ef36..d546fd6 100644[m
[1m--- a/.gitignore[m
[1m+++ b/.gitignore[m
[36m@@ -1 +1,2 @@[m
[31m-.idea[m
\ No newline at end of file[m
[32m+[m[32m.idea[m
[32m+[m[32m*~[m
\ No newline at end of file[m
[1mdiff --git a/client/.gitignore b/client/.gitignore[m
[1mindex 76add87..f06235c 100644[m
[1m--- a/client/.gitignore[m
[1m+++ b/client/.gitignore[m
[36m@@ -1,2 +1,2 @@[m
 node_modules[m
[31m-dist[m
\ No newline at end of file[m
[32m+[m[32mdist[m
[1mdiff --git a/client/gruntFile.js b/client/gruntFile.js[m
[1mindex 3eb736d..cf39133 100644[m
[1m--- a/client/gruntFile.js[m
[1m+++ b/client/gruntFile.js[m
[36m@@ -1,3 +1,12 @@[m
[32m+[m[32m// 'use strict';[m
[32m+[m
[32m+[m[32m// var[m
[32m+[m[32m//   LIVERELOAD_PORT = 35729,[m
[32m+[m[32m//   lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT }),[m
[32m+[m[32m//   mountFolder = function( connect, dir ) {[m
[32m+[m[32m//     return connect.static(require('path').resolve(dir));[m
[32m+[m[32m//   };[m
[32m+[m
 module.exports = function (grunt) {[m
 [m
   grunt.loadNpmTasks('grunt-contrib-concat');[m
[36m@@ -9,10 +18,20 @@[m [mmodule.exports = function (grunt) {[m
   grunt.loadNpmTasks('grunt-recess');[m
   grunt.loadNpmTasks('grunt-karma');[m
   grunt.loadNpmTasks('grunt-html2js');[m
[32m+[m[32m  // grunt.loadNpmTasks('grunt-contrib-connect');[m
[32m+[m[32m  grunt.loadNpmTasks('grunt-open');[m
 [m
   // Default task.[m
   grunt.registerTask('default', ['jshint','build','karma:unit']);[m
[32m+[m[32m  grunt.registerTask('new', ['jshint','build','karma:unit','server']);[m
   grunt.registerTask('build', ['clean','html2js','concat','recess:build','copy:assets']);[m
[32m+[m[32m  grunt.registerTask('server', function() {[m
[32m+[m[32m    grunt.task.run([[m
[32m+[m[32m      // 'connect:livereload',[m
[32m+[m[32m      'open:server',[m
[32m+[m[32m      'watch'[m
[32m+[m[32m    ]);[m
[32m+[m[32m  });[m
   grunt.registerTask('release', ['clean','html2js','uglify','jshint','karma:unit','concat:index', 'recess:min','copy:assets']);[m
   grunt.registerTask('test-watch', ['karma:watch']);[m
 [m
[36m@@ -47,7 +66,7 @@[m [mmodule.exports = function (grunt) {[m
         common: ['src/common/**/*.tpl.html'][m
       },[m
       less: ['src/less/stylesheet.less'], // recess:build doesn't accept ** in its file patterns[m
[31m-      lessWatch: ['src/less/**/*.less'][m
[32m+[m[32m      lessWatch: ['src/less/**/*.less', 'vendor/bootstrap/**/*.less'][m
     },[m
     clean: ['<%= distdir %>/*'],[m
     copy: {[m
[36m@@ -152,7 +171,63 @@[m [mmodule.exports = function (grunt) {[m
         }[m
       }[m
     },[m
[32m+[m[32m    // connect: {[m
[32m+[m[32m    //   options: {[m
[32m+[m[32m    //     port: 3000,[m
[32m+[m[32m    //     hostname: '0.0.0.0'[m
[32m+[m[32m    //     // base: './dist'[m
[32m+[m[32m    //     // keepalive: true,[m
[32m+[m[32m    //     // livereload: true[m
[32m+[m[32m    //   },[m
[32m+[m[32m    //   livereload: {[m
[32m+[m[32m    //     options: {[m
[32m+[m[32m    //       middleware: function( connect ) {[m
[32m+[m[32m    //         return [[m
[32m+[m[32m    //           lrSnippet,[m
[32m+[m[32m    //           mountFolder(connect, './dist')[m
[32m+[m[32m    //         ];[m
[32m+[m[32m    //       }[m
[32m+[m[32m    //     }[m
[32m+[m[32m    //   }[m
[32m+[m[32m    // },[m
[32m+[m[32m    open: {[m
[32m+[m[32m      server: {[m
[32m+[m[32m        // url: 'http://localhost:<%= connect.options.port %>'[m
[32m+[m[32m        url: 'http://localhost:3000/'[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    // connect: {[m
[32m+[m[32m    //   all: {[m
[32m+[m[32m    //     options:{[m
[32m+[m[32m    //       port: 3000,[m
[32m+[m[32m    //       hostname: '0.0.0.0',[m
[32m+[m[32m    //       base: 'app',[m
[32m+[m[32m    //       keepalive: true,[m
[32m+[m[32m    //       livereload: true[m
[32m+[m[32m    //     }[m
[32m+[m[32m    //   }[m
[32m+[m[32m    // },[m
[32m+[m[32m    // open: {[m
[32m+[m[32m    //   all: {[m
[32m+[m[32m    //     path: 'http://localhost:<%= connect.all.options.port%>'[m
[32m+[m[32m    //   }[m
[32m+[m[32m    // },[m
     watch:{[m
[32m+[m[32m      // options: {[m
[32m+[m[32m      //   livereload: true[m
[32m+[m[32m      // },[m
[32m+[m[32m      // livereload: {[m
[32m+[m[32m      //   files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],[m
[32m+[m[32m      //   tasks:['default','timestamp'],[m
[32m+[m[32m      //   // files: [[m
[32m+[m[32m      //   //   '{,*/}*.html',[m
[32m+[m[32m      //   //   'static/{,*/}*.{css,js,png,jpg,gif,svg}'[m
[32m+[m[32m      //   // ],[m
[32m+[m[32m      //   // tasks: ['jshint'],[m
[32m+[m[32m      //   options: {[m
[32m+[m[32m      //     livereload: LIVERELOAD_PORT[m
[32m+[m[32m      //   }[m
[32m+[m[32m      // },[m
       all: {[m
         files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],[m
         tasks:['default','timestamp'][m
[1mdiff --git a/client/package.json b/client/package.json[m
[1mindex 703954e..227817a 100644[m
[1m--- a/client/package.json[m
[1m+++ b/client/package.json[m
[36m@@ -19,7 +19,9 @@[m
   "engines": {[m
     "node": ">= 0.8.4"[m
   },[m
[31m-  "dependencies": {},[m
[32m+[m[32m  "dependencies": {[m
[32m+[m[32m    "grunt-contrib-watch": "~0.5.3"[m
[32m+[m[32m  },[m
   "devDependencies": {[m
     "grunt": "~0.4.0",[m
     "grunt-recess": "~0.3",[m
[36m@@ -30,6 +32,9 @@[m
     "grunt-contrib-uglify": "~0.1.1",[m
     "grunt-karma": "~0.4.4",[m
     "grunt-html2js": "~0.1.0",[m
[31m-    "grunt-contrib-watch": "~0.3.1"[m
[32m+[m[32m    "grunt-contrib-watch": "~0.3.1",[m
[32m+[m[32m    "connect-livereload": "~0.3.2",[m
[32m+[m[32m    "grunt-contrib-connect": "~0.7.1",[m
[32m+[m[32m    "grunt-open": "~0.2.3"[m
   }[m
 }[m
[1mdiff --git a/client/src/app/app.js b/client/src/app/app.js[m
[1mindex 3e630dc..189073d 100644[m
[1m--- a/client/src/app/app.js[m
[1m+++ b/client/src/app/app.js[m
[36m@@ -14,7 +14,7 @@[m [mangular.module('app', [[m
 [m
 angular.module('app').constant('MONGOLAB_CONFIG', {[m
   baseUrl: '/databases/',[m
[31m-  dbName: 'ascrum'[m
[32m+[m[32m  dbName: 'ngpmtool'[m
 });[m
 [m
 //TODO: move those messages to a separate module[m
[1mdiff --git a/client/src/app/header.tpl.html b/client/src/app/header.tpl.html[m
[1mindex fde2165..18b9df7 100644[m
[1m--- a/client/src/app/header.tpl.html[m
[1m+++ b/client/src/app/header.tpl.html[m
[36m@@ -1,26 +1,33 @@[m
 <div class="navbar" ng-controller="HeaderCtrl">[m
     <div class="navbar-inner">[m
[31m-        <a class="brand" ng-click="home()">AScrum</a>[m
[32m+[m
[32m+[m[32m      <a class="brand" ng-click="home()">AScrum</a>[m
         <ul class="nav">[m
             <li ng-class="{active:isNavbarActive('projectsinfo')}"><a href="/projectsinfo">Current Projects</a></li>[m
         </ul>[m
 [m
         <ul class="nav" ng-show="isAuthenticated()">[m
             <li ng-class="{active:isNavbarActive('projects')}"><a href="/projects">My Projects</a></li>[m
[32m+[m
             <li class="dropdown" ng-class="{active:isNavbarActive('admin'), open:isAdminOpen}" ng-show="isAdmin()">[m
                 <a id="adminmenu" role="button" class="dropdown-toggle" ng-click="isAdminOpen=!isAdminOpen">Admin<b class="caret"></b></a>[m
[32m+[m
                 <ul class="dropdown-menu" role="menu" aria-labelledby="adminmenu">[m
                     <li><a tabindex="-1" href="/admin/projects" ng-click="isAdminOpen=false">Manage Projects</a></li>[m
                     <li><a tabindex="-1" href="/admin/users" ng-click="isAdminOpen=false">Manage Users</a></li>[m
                 </ul>[m
[32m+[m
             </li>[m
         </ul>[m
[32m+[m
         <ul class="nav pull-right" ng-show="hasPendingRequests()">[m
             <li class="divider-vertical"></li>[m
             <li><a href="#"><img src="/static/img/spinner.gif"></a></li>[m
         </ul>[m
         <login-toolbar></login-toolbar>[m
[32m+[m
     </div>[m
[32m+[m
     <div>[m
         <ul class="breadcrumb">[m
             <li ng-repeat="breadcrumb in breadcrumbs.getAll()">[m
[36m@@ -32,4 +39,5 @@[m
             </li>[m
         </ul>[m
     </div>[m
[31m-</div>[m
\ No newline at end of file[m
[32m+[m
[32m+[m[32m</div>[m
[1mdiff --git a/client/src/app/projectsinfo/list.tpl.html b/client/src/app/projectsinfo/list.tpl.html[m
[1mindex f5acc29..f3f91af 100644[m
[1m--- a/client/src/app/projectsinfo/list.tpl.html[m
[1m+++ b/client/src/app/projectsinfo/list.tpl.html[m
[36m@@ -1 +1,21 @@[m
[31m-<h3>Projects info</h3>[m
\ No newline at end of file[m
[32m+[m[32m<h3>Projects info</h3>[m
[32m+[m[32m<div class="accordion">[m
[32m+[m[32m  Search: <input ng-model="query">[m[41m  [m
[32m+[m[32m</div>[m
[32m+[m
[32m+[m[32m<table class="table table-bordered table-condensed table-striped table-hover">[m
[32m+[m[32m    <thead>[m
[32m+[m[32m    <tr>[m
[32m+[m[32m        <th class="span3">ID</th>[m
[32m+[m[32m        <th class="span3">Name</th>[m
[32m+[m[32m        <th class="span5">Description</th>[m
[32m+[m[32m    </tr>[m
[32m+[m[32m    </thead>[m
[32m+[m[32m    <tbody>[m
[32m+[m[32m    <tr ng-repeat="project in projects | filter:query">[m
[32m+[m[32m        <td>{{project.$id()}}</td>[m
[32m+[m[32m        <td>{{project.name}}</td>[m
[32m+[m[32m        <td>{{project.desc}}</td>[m
[32m+[m[32m    </tr>[m
[32m+[m[32m    </tbody>[m
[32m+[m[32m</table>[m
[1mdiff --git a/client/src/app/projectsinfo/projectsinfo.js b/client/src/app/projectsinfo/projectsinfo.js[m
[1mindex 97227bd..a1ef852 100644[m
[1m--- a/client/src/app/projectsinfo/projectsinfo.js[m
[1m+++ b/client/src/app/projectsinfo/projectsinfo.js[m
[36m@@ -13,4 +13,5 @@[m [mangular.module('projectsinfo', [], ['$routeProvider', function($routeProvider){[m
 [m
 angular.module('projectsinfo').controller('ProjectsInfoListCtrl', ['$scope', 'projects', function($scope, projects){[m
   $scope.projects = projects;[m
[32m+[m[32m                                                                                           console.log(projects);[m
 }]);[m
\ No newline at end of file[m
[1mdiff --git a/client/src/index.html b/client/src/index.html[m
[1mindex 599e870..5b2bc16 100644[m
[1m--- a/client/src/index.html[m
[1m+++ b/client/src/index.html[m
[36m@@ -2,6 +2,8 @@[m
 <html lang="en" ng-app="app">[m
 <head>[m
   <link rel="stylesheet" type="text/css" href="/static/<%= grunt.config.get('pkg.name') %>.css"/>[m
[32m+[m[32m  <!-- <script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script> -->[m
[32m+[m[32m  <!-- <script src="http://localhost:35729/livereload.js"></script> -->[m
   <script type="text/javascript" src="/static/jquery.js"></script>[m
   <script type="text/javascript" src="/static/angular.js"></script>[m
   <script type="text/javascript" src="/static/mongolab.js"></script>[m
[36m@@ -13,5 +15,6 @@[m
   <div ng-include="'header.tpl.html'"></div>[m
   <div ng-include="'notifications.tpl.html'" class="container-fluid" ng-show="notifications.getCurrent().length"></div>[m
   <div ng-view class="container-fluid"></div>[m
[32m+[m[32m  <!-- <script src="http://localhost:35729/livereload.js"></script> -->[m
 </body>[m
[31m-</html>[m
\ No newline at end of file[m
[32m+[m[32m</html>[m
[1mdiff --git a/client/test/config/unit.js b/client/test/config/unit.js[m
[1mindex ceed8d0..0c25677 100644[m
[1m--- a/client/test/config/unit.js[m
[1m+++ b/client/test/config/unit.js[m
[36m@@ -50,7 +50,7 @@[m [mautoWatchInterval = 0;[m
 // - Opera[m
 // - Safari[m
 // - PhantomJS[m
[31m-browsers = ['Chrome'];[m
[32m+[m[32mbrowsers = ['Firefox'];[m
 [m
 // Continuous Integration mode[m
 // if true, it capture browsers, run tests and exit[m
[1mdiff --git a/client/vendor/bootstrap/tables.less b/client/vendor/bootstrap/tables.less[m
[1mindex 13c37c6..33b4d33 100644[m
[1m--- a/client/vendor/bootstrap/tables.less[m
[1m+++ b/client/vendor/bootstrap/tables.less[m
[36m@@ -138,9 +138,6 @@[m [mtable {[m
 [m
 }[m
 [m
[31m-[m
[31m-[m
[31m-[m
 // ZEBRA-STRIPING[m
 // --------------[m
 [m
[36m@@ -154,20 +151,20 @@[m [mtable {[m
   }[m
 }[m
 [m
[31m-[m
 // HOVER EFFECT[m
 // ------------[m
 // Placed here since it has to come after the potential zebra striping[m
[32m+[m
 .table-hover {[m
   tbody {[m
     tr:hover td,[m
     tr:hover th {[m
       background-color: @tableBackgroundHover;[m
[32m+[m	[32m  cursor: pointer;[m
     }[m
   }[m
 }[m
 [m
[31m-[m
 // TABLE CELL SIZING[m
 // -----------------[m
 [m
[36m@@ -208,7 +205,6 @@[m [mtable [class*=span],[m
 }[m
 [m
 [m
[31m-[m
 // TABLE BACKGROUNDS[m
 // -----------------[m
 // Exact selectors below required to override .table-striped[m
[1mdiff --git a/client/vendor/mongolab/mongolab-resource.js b/client/vendor/mongolab/mongolab-resource.js[m
[1mindex dfdd63d..144589c 100644[m
[1m--- a/client/vendor/mongolab/mongolab-resource.js[m
[1m+++ b/client/vendor/mongolab/mongolab-resource.js[m
[36m@@ -7,7 +7,7 @@[m [mangular.module('mongolabResource', []).factory('mongolabResource', ['MONGOLAB_CO[m
     if (MONGOLAB_CONFIG.apiKey) {[m
       defaultParams.apiKey = MONGOLAB_CONFIG.apiKey;[m
     }[m
[31m-    [m
[32m+[m
     var thenFactoryMethod = function (httpPromise, successcb, errorcb, isArray) {[m
       var scb = successcb || angular.noop;[m
       var ecb = errorcb || angular.noop;[m
[1mdiff --git a/server/config.js b/server/config.js[m
[1mindex 8e99a84..489e627 100644[m
[1m--- a/server/config.js[m
[1m+++ b/server/config.js[m
[36m@@ -3,10 +3,10 @@[m [mpath = require('path');[m
 module.exports = {[m
   mongo: {[m
     dbUrl: 'https://api.mongolab.com/api/1',            // The base url of the MongoLab DB server[m
[31m-    apiKey: '4fb51e55e4b02e56a67b0b66'                 // Our MongoLab API key[m
[32m+[m[32m    apiKey: 'KrjtIFDbzyY45d_4-guscfW3_C39xR7m'                 // Our MongoLab API key[m
   },[m
   security: {[m
[31m-    dbName: 'ascrum',                                   // The name of database that contains the security information[m
[32m+[m[32m    dbName: 'ngpmtool',                                   // The name of database that contains the security information[m
     usersCollection: 'users'                            // The name of the collection contains user information[m
   },[m
   server: {[m
warning: LF will be replaced by CRLF in client/package.json.
The file will have its original line endings in your working directory.
