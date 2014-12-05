angular.module('taskclass', [
	'ngRoute',
	'resources.taskclass',
	'services.crud',
	'services.i18nNotifications',
	'ui.bootstrap',
	'security.authorization',
	'filters.pagination',
	'directives.tableactive',
	'directives.icon',
	'directives.propertybar',
	'directives.test',
	'directives.crud.edit',
	'directives.accordionGroupChevron',
	'underscore',
])
.config([
	'$routeProvider',
	'crudRouteProvider',
	function (
		$routeProvider
		){
			$routeProvider.when('/taskclass', {
			templateUrl:'settings/taskclass/taskclass-list.tpl.html',
			controller:'TaskClassListCtrl',
			 resolve:{
			 	taskclass: ['TaskClass', function(TaskClass) { return new TaskClass.all(); }],
			}
		});

			$routeProvider.when('/taskclass/new', {
			templateUrl:'settings/taskclass/taskclass-edit.tpl.html',
			controller:'TaskClassEditCtrl',
			resolve:{
				taskclass: ['TaskClass', function(TaskClass) { return new TaskClass(); }],

			}
		});

			$routeProvider.when('/taskclass/:taskclassId/edit', {
			templateUrl:'settings/taskclass/taskclass-edit.tpl.html',
			controller:'TaskClassEditCtrl',
			resolve:{
				taskclass: [
				'TaskClass',
				'$route',
				function(TaskClass, $route) {
					console.log("in routeprovider edit");
					return TaskClass.getById($route.current.params.taskclassId);
					console.log("end of routeprovider edit");
				}
			],
				
			}
		});

			$routeProvider.when('/taskclass/:taskclassId', {
			redirectTo: function (routeParams, currentPath) {
				return currentPath + "/edit";
			}
		});

			$routeProvider.when('/taskclass/:taskclassId/view', {
			redirectTo: function (routeParams, currentPath) {
				return "/taskclass";
			}
		});

	}
	])
.controller('TaskClassListCtrl', [
	'$scope',
	'$location',
	'taskclass',
	'TaskClass',
	'security',
	'crudListMethods',
	'crudEditHandlers',
	'$q',
	function (
		$scope,
		$location,
		taskclass,
		TaskClass,
		security,
		crudListMethods,
		crudEditHandlers,
		$q
	) {
		$scope.taskclass = taskclass;
		$scope.taskclassCrudHelpers = {}
		angular.extend($scope, crudListMethods('/taskclass'));
		angular.extend($scope.taskclassCrudHelpers, crudListMethods('/taskclass'));
	}
	])

.controller('TaskClassEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	'taskclass',
	'TaskClass',
	'crudListMethods',
	'crudEditHandlers',
	
	function ($scope, $location, i18nNotifications, taskclass, TaskClass, crudListMethods,crudEditHandlers ) {

		console.log("Inside Ctrl");
		$scope.taskclass = taskclass;
		console.log(taskclass);
		console.log(taskclass.taskstatuskey);
		
		$scope.onSave = function (taskclass) {
			var taskClassObj = new TaskClass(taskclass);
			var successcb = function(){
				console.log("saved successfully!!!");
				};
			var failurecb = function(){
				console.log("could not save");
				};
			 i18nNotifications.pushForNextRoute('crud.taskclass.save.success', 'success',{id : taskclass.$id()});
			 $location.path('/taskclass');
			
		};

		$scope.onError = function() {
			i18nNotifications.pushForCurrentRoute('crud.taskclass.save.error', 'error');
		};

		$scope.onRemove = function(taskclass) {
			i18nNotifications.pushForNextRoute('crud.taskclass.remove.success', 'success', {id : taskclass.$id()});
			$location.path('/taskclass');
		};


		}

	
]);