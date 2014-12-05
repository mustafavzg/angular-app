angular.module('app', [
	'ngRoute',
	'projectsinfo',
	'dashboard',
	'projects',
	'admin',
	'users',
	'suggestions',
	'taskclass',
	'workflows',
	'services.breadcrumbs',
	'services.i18nNotifications',
	'services.httpRequestTracker',
	'services.locationHistory',
	'security',
	'directives.crud',
	'directives.icon',
	'templates.app',
	'templates.common',
	'templates.vendor',
	'ui.bootstrap',
	'underscore',
	'moment'
]);

angular.module('app').constant('MONGOLAB_CONFIG', {
	baseUrl: '/databases/',
	dbName: 'ngpmtool'
});

angular.module('app').constant('ATHENAWEBAPP_CONFIG', {
	baseUrl: '/hive'
	// baseUrl: '/databases/',
	// dbName: 'ngpmtool'
});

angular.module('app').constant('DB_CONFIG', {
	isDevNet: false
});


//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
	'errors.route.changeError':"Route change error: {{reason}}",

	'crud.unsaved':"Page has unsaved changes. Please save/revert the changes and try again",

	// --------------------------------------------------
	// Users
	// --------------------------------------------------
	//TODO: deprecate following
	'crud.user.save.success':"User was saved successfully. (id :'{{id}}')",
	'crud.user.save.error':"An error occurred while saving the user: '{{error}}'",

	'crud.user.remove.success':"User was removed successfully. (id :'{{id}}')",
	'crud.user.remove.error':"An error occurred while removing the user : '{{error}}'.",
	// --------------------------------------------------
	//new set of notifications
	'crud.users.save.success':"User was saved successfully. (id :'{{id}}')",
	'crud.users.save.error':"An error occurred while saving the user: '{{error}}'",

	'crud.users.update.success':"User was updated successfully. (id :'{{id}}')",
	'crud.users.update.error':"An error occurred while updating the user: '{{error}}'",

	'crud.users.remove.success':"User was removed successfully. (id :'{{id}}')",
	'crud.users.remove.error':"An error occurred while removing the user : '{{error}}'.",

	// --------------------------------------------------
	// Projects
	// --------------------------------------------------
	//TODO: deprecate following
	'crud.project.save.success':"Project was saved successfully. (id :'{{id}}')",
	'crud.project.save.error':"An error occurred while saving the project: '{{error}}'",

	'crud.project.remove.success':"Project was removed successfully. (id :'{{id}}')",
	'crud.project.remove.error':"An error occurred while removing the project : '{{error}}'.",


	// --------------------------------------------------
	//new set of notifications
	'crud.projects.save.success':"Project was saved successfully. (id :'{{id}}')",
	'crud.projects.save.error':"An error occurred while saving the project: '{{error}}'",

	'crud.projects.update.success':"Project was updated successfully. (id :'{{id}}')",
	'crud.projects.update.error':"An error occurred while updating the project: '{{error}}'",

	'crud.projects.remove.success':"Project was removed successfully. (id :'{{id}}')",
	'crud.projects.remove.error':"An error occurred while removing the project : '{{error}}'.",

	// --------------------------------------------------
	// Product Backlog
	// --------------------------------------------------
	//TODO: deprecate following
	'crud.backlog.save.success':"Backlog Item was saved successfully. (id :'{{id}}')",
	'crud.backlog.save.error':"An error occurred while saving the backlog item: '{{error}}'",

	'crud.backlog.remove.success':"Backlog item was removed successfully. (id :'{{id}}')",
	'crud.backlog.remove.error':"An error occurred while removing the backlog item : '{{error}}'.",

	// --------------------------------------------------
	//new set of notifications
	'crud.productbacklog.save.success':"Backlog Item was saved successfully. (id :'{{id}}')",
	'crud.productbacklog.save.error':"An error occurred while saving the backlog item: '{{error}}'",

	'crud.productbacklog.update.success':"Backlog Item was updated successfully. (id :'{{id}}')",
	'crud.productbacklog.update.error':"An error occurred while updating the backlog item: '{{error}}'",

	'crud.productbacklog.remove.success':"Backlog item was removed successfully. (id :'{{id}}')",
	'crud.productbacklog.remove.error':"An error occurred while removing the backlog item : '{{error}}'.",

	// --------------------------------------------------
	// Tasks
	// --------------------------------------------------
	//TODO: deprecate following
	'crud.task.save.success':"Task was saved successfully. (id :'{{id}}')",
	'crud.task.save.error':"An error occurred while saving the task: '{{error}}'",

	'crud.task.remove.success':"Task was removed successfully. (id :'{{id}}')",
	'crud.task.remove.error':"An error occurred while removing the task : '{{error}}'.",

	// --------------------------------------------------
	//new set of notifications
	'crud.tasks.save.success':"Task was saved successfully. (id :'{{id}}')",
	'crud.tasks.save.error':"An error occurred while saving the task: '{{error}}'",

	'crud.tasks.update.success':"Task was updated successfully. (id :'{{id}}')",
	'crud.tasks.update.error':"An error occurred while updating the task: '{{error}}'",

	'crud.tasks.remove.success':"Task was removed successfully. (id :'{{id}}')",
	'crud.tasks.remove.error':"An error occurred while removing the task : '{{error}}'.",

	// --------------------------------------------------
	// Sprints
	// --------------------------------------------------
	//TODO: deprecate following
	'crud.sprint.save.success':"Sprint was saved successfully. (id :'{{id}}')",
	'crud.sprint.save.error':"An error occurred while saving the sprint: '{{error}}'",
	'crud.sprint.expired.error':"Cannot edit an expired sprint",

	'crud.sprint.remove.success':"Sprint was removed successfully. (id :'{{id}}')",
	'crud.sprint.remove.error':"An error occurred while removing the sprint : '{{error}}'.",

	// --------------------------------------------------
	//new set of notifications
	'crud.sprints.save.success':"Sprint was saved successfully. (id :'{{id}}')",
	'crud.sprints.save.error':"An error occurred while saving the sprint: '{{error}}'",

	'crud.sprints.update.success':"Sprint was updated successfully. (id :'{{id}}')",
	'crud.sprints.update.error':"An error occurred while updating the sprint: '{{error}}'",

	'crud.sprints.expired.error':"Cannot edit an expired sprint",

	'crud.sprints.remove.success':"Sprint was removed successfully. (id :'{{id}}')",
	'crud.sprints.remove.error':"An error occurred while removing the sprint : '{{error}}'.",


	// --------------------------------------------------
	'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
	'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
	'login.error.invalidCredentials': "Login failed. Please check your credentials and try again.",
	'login.error.serverError': "There was a problem with authenticating: {{exception}}.",

	// --------------------------------------------------
	// Gantt chart errors
	'gantt.task.update.error': "Updates for this item are not allowed: (name: {{subject}}, id: {{id}}).",
	'gantt.row.update.error': "Updates for this item are not allowed: (name: {{description}}, id: {{id}}).",
	'gantt.task.data.error': "Error in Gantt Task data: 'to' date is undefined : (name: {{subject}}, id: {{id}}).",


	// --------------------------------------------------
	// Comments
	'crud.comments.save.success':"Comment was saved successfully. (id :'{{id}}')",
	'crud.comments.save.error':"An error occurred while saving the comment: '{{error}}'",

	'crud.comments.update.success':"Comment was updated successfully. (id :'{{id}}')",
	'crud.comments.update.error':"An error occurred while updating the comment: '{{error}}'",

	'crud.comments.remove.success':"Comment ['{{text}}'] was removed successfully. (id :'{{id}}')",
	'crud.comments.remove.error':"An error occurred while removing the comment : '{{error}}'.",

	// --------------------------------------------------
	// Kanban board notifications
	'crud.kanban.save.success':"{{resources}} ({{resourceids}}) successfully updated.",
	'crud.kanban.save.error':"An error occurred while updating {{resources}} ({{resourceids}}): '{{error}}'",

	// --------------------------------------------------
	// Task Class
	'crud.taskclass.save.success':"Task Class was saved successfully. (id :'{{id}}')",
	'crud.taskclass.save.error':"An error occurred while saving the taskclass: '{{error}}'",

	'crud.taskclass.remove.success':"Task Class was removed successfully. (id :'{{id}}')",
	'crud.taskclass.remove.error':"An error occurred while removing the taskclass : '{{error}}'.",

	// --------------------------------------------------
	// Document
	'crud.document.save.success':"Document was saved successfully. (id :'{{id}}')",
	'crud.document.save.error':"An error occurred while saving the document: '{{error}}'",

	'crud.document.remove.success':"Document was removed successfully. (id :'{{id}}')",
	'crud.document.remove.error':"An error occurred while removing the document : '{{error}}'."
});

angular.module('app').config([
	'$routeProvider',
	'$locationProvider',
	function (
		$routeProvider,
		$locationProvider
	) {
		$locationProvider.html5Mode(true);
		// $routeProvider.when('/suggestions', {templateUrl:'/settings/suggestions/suggestions.tpl.html'});
		// $routeProvider.when('/taskclass', {templateUrl:'/settings/taskclass/taskclass.tpl.html'});
		$routeProvider.otherwise({redirectTo:'/projects'});
	}
]);

angular.module('app').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)

  //security.login();
  //security.requestCurrentUser();

}]);

angular.module('app').controller('AppCtrl', [
	'$scope',
	'i18nNotifications',
	'localizedMessages',
	'locationHistory',
	'$rootScope',
	'$location',
	function(
		$scope,
		i18nNotifications,
		localizedMessages,
		locationHistory,
		$rootScope,
		$location
	) {
		$scope.notifications = i18nNotifications;
		// $scope.locationHistory = locationHistory;

		$scope.removeNotification = function (notification) {
			i18nNotifications.remove(notification);
		};
		$scope.removeAllNotifications = function () {
			i18nNotifications.removeAll();
		};

		locationHistory.init();

		// $rootScope.$on('$routeChangeSuccess', function(event, current, previous, other){
		// 	locationHistory.push($location.$$path);
		// 	console.log("Route changed");
		// 	console.log({
		// 		history: locationHistory.getHistory(),
		// 		lhcurrent: locationHistory.getCurrent(),
		// 		future: locationHistory.getFuture(),
		// 		location: $location,
		// 		event: event,
		// 		current: current,
		// 		previous: previous,
		// 		other: other
		// 	});
		// });

		$scope.$on('$routeChangeError', function(event, current, previous, rejection){
			i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {reason: rejection}, {rejection: rejection});
			// console.log({rejection: rejection});
		});
	}
]);

angular.module('app').controller('HeaderCtrl', [
	'$scope',
	'$location',
	'locationHistory',
	'$route',
	'security',
	'breadcrumbs',
	'notifications',
	'httpRequestTracker',
	function (
		$scope,
		$location,
		locationHistory,
		$route,
		security,
		breadcrumbs,
		notifications,
		httpRequestTracker
	) {
		$scope.location = $location;
		$scope.breadcrumbs = breadcrumbs;

		$scope.isAuthenticated = security.isAuthenticated;
		$scope.isAdmin = security.isAdmin;

		$scope.home = function () {
			if (security.isAuthenticated()) {
				$location.path('/dashboard');
			} else {
				$location.path('/projectsinfo');
			}
		};

		$scope.back = function () {
			locationHistory.prev();
		};

		$scope.showBackLink = function () {
			return locationHistory.hasHistory();
		};

		$scope.isNavbarActive = function (navBarPath) {
			return navBarPath === breadcrumbs.getFirst().name;
		};

		$scope.hasPendingRequests = function () {
			return httpRequestTracker.hasPendingRequests();
		};
	}
]);
