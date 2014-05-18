angular.module('app', [
	'ngRoute',
	'projectsinfo',
	'dashboard',
	'projects',
	'admin',
	'users',
	'services.breadcrumbs',
	'services.i18nNotifications',
	'services.httpRequestTracker',
	'security',
	'directives.crud',
	'templates.app',
	'templates.common',
	'ui.bootstrap',
	'underscore',
	'moment'
]);

angular.module('app').constant('MONGOLAB_CONFIG', {
	baseUrl: '/databases/',
	dbName: 'ngpmtool'
});

angular.module('app').constant('ATHENAWEBAPP_CONFIG', {
	baseUrl: '/projectile'
	// baseUrl: '/databases/',
	// dbName: 'ngpmtool'
});

//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
	'errors.route.changeError':'Route change error',

	'crud.user.save.success':"User was saved successfully. (id :'{{id}}')",
	'crud.user.save.error':"An error occurred while saving the user ...",

	'crud.user.remove.success':"User was removed successfully. (id :'{{id}}')",
	'crud.user.remove.error':"An error occurred while removing the user : id '{{id}}'.",

	// --------------------------------------------------
	'crud.project.save.success':"Project was saved successfully. (id :'{{id}}')",
	'crud.project.save.error':"An error occurred while saving the project ...",

	'crud.project.remove.success':"Project was removed successfully. (id :'{{id}}')",
	'crud.project.remove.error':"An error occurred while removing the project : id '{{id}}'.",

	// --------------------------------------------------
	'crud.backlog.save.success':"Backlog Item was saved successfully. (id :'{{id}}')",
	'crud.backlog.save.error':"An error occurred while saving the backlog item ...",

	'crud.backlog.remove.success':"Backlog item was removed successfully. (id :'{{id}}')",
	'crud.backlog.remove.error':"An error occurred while removing the backlog item : id '{{id}}'.",

	// --------------------------------------------------
	'crud.task.save.success':"Task was saved successfully. (id :'{{id}}')",
	'crud.task.save.error':"An error occurred while saving the task ...",

	'crud.task.remove.success':"Task was removed successfully. (id :'{{id}}')",
	'crud.task.remove.error':"An error occurred while removing the task : id '{{id}}'.",

	// --------------------------------------------------
	'crud.sprint.save.success':"Sprint was saved successfully. (id :'{{id}}')",
	'crud.sprint.save.error':"An error occurred while saving the sprint ...",

	'crud.sprint.remove.success':"Sprint was removed successfully. (id :'{{id}}')",
	'crud.sprint.remove.error':"An error occurred while removing the sprint : id '{{id}}'.",

	// --------------------------------------------------
	'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
	'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
	'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
	'login.error.serverError': "There was a problem with authenticating: {{exception}}."
});

angular.module('app').config([
	'$routeProvider',
	'$locationProvider',
	function (
		$routeProvider,
		$locationProvider
	) {
		$locationProvider.html5Mode(true);
		$routeProvider.otherwise({redirectTo:'/projects'});
	}
]);

angular.module('app').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);

angular.module('app').controller('AppCtrl', [
	'$scope',
	'i18nNotifications',
	'localizedMessages',
	function(
		$scope,
		i18nNotifications
	) {
		$scope.notifications = i18nNotifications;

		$scope.removeNotification = function (notification) {
			i18nNotifications.remove(notification);
		};

		$scope.$on('$routeChangeError', function(event, current, previous, rejection){
			i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
			// console.log({rejection: rejection});
		});
	}
]);

angular.module('app').controller('HeaderCtrl', [
	'$scope',
	'$location',
	'$route',
	'security',
	'breadcrumbs',
	'notifications',
	'httpRequestTracker',
	function (
		$scope,
		$location,
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

		$scope.isNavbarActive = function (navBarPath) {
			return navBarPath === breadcrumbs.getFirst().name;
		};

		$scope.hasPendingRequests = function () {
			return httpRequestTracker.hasPendingRequests();
		};
	}
]);
