angular.module('suggestions', [
	'services.crud',
	'resources.suggestions'
])

.config(['$routeProvider', 'suggestions', function ($routeProvider, suggestions) {
	$routeProvider.when('/suggestions', {
		templateUrl:'settings/suggestions/suggestions.tpl.html',
		controller:'SuggestionsCtrl',
		suggestion: ['suggestions', function(suggestions) { return new suggestions(); }]
	});
	$routeProvider.when('/suggestions/list', {
		templateUrl:'settings/suggestions/suggestions-list.tpl.html',
		controller:'SuggestionsListCtrl',
		suggestion: ['suggestions', function(suggestions) { return new suggestions(); }]
	});
	$routeProvider.when('/suggestions/new', {
		templateUrl:'settings/suggestions/suggestions-edit.tpl.html',
		controller:'SuggestionsEditCtrl',
		suggestion: ['suggestions', function(suggestions) { return new suggestions(); }]
	});
/*		crudRouteProvider.routesFor('Users', 'projects', 'projects/:projectId')
		.whenList({
			projectId: projectId,
			users: [
				'Users',
				function(Users) {
					return Users.all();
				}
			],
			currentUser: securityAuthorizationProvider.requireAdminUser
		})
		.whenNew({
			projectId: projectId,
			user: ['Users', function(Users) { return new Users(); }],
			currentUser: securityAuthorizationProvider.requireAdminUser
		})
		.whenEdit({
			projectId: projectId,
			user:[
				'$route',
				'Users',
				function ($route, Users) {
					return Users.getById($route.current.params.itemId);
				}
			],
			currentUser: securityAuthorizationProvider.requireAdminUser
		})
		.whenView({
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
			user:[
				'$route',
				'Users',
				function ($route, Users) {
					return Users.getById($route.current.params.itemId);
				}
			],
			currentUser: securityAuthorizationProvider.requireAdminUser
		});

	crudRouteProvider.routesFor('Suggestions')
	// .whenList({
	// 	suggestions: ['Suggestions', function(Suggestions) { return Suggestions.all(); }]
	// 	// adminUser: securityAuthorizationProvider.requireAdminUser
	// })
			projectId: projectId,
			user: ['Users', function(Users) { return new Users(); }]
	.whenEdit({
		suggestion: [
			'Suggestions',
			'$route',
			function(Suggestions, $route) {
				return Suggestions.getById($route.current.params.itemId);
			}
		]
		// users: getAllUsers,
		//adminUser: securityAuthorizationProvider.requireAdminUser
	});
*/
}])
.controller('SuggestionsCtrl', [
	'$scope',
	'$location',
	'crudListMethods',
	'crudEditHandlers',
	'suggestion',
	function ($scope, $location, crudListMethods, crudEditHandlers, suggestion) {
		$scope.statuses = [
			"Bug",
			"Feature"
		];
		$scope.suggestion = {};
		$scope.suggestionscrudhelpers = {};
		// angular.extend($scope.suggestionscrudhelpers, crudListMethods('/suggestions'));
		// angular.extend($scope, crudEditHandlers('suggestion'));
		$scope.onSave = function (suggestion) {
			i18nNotifications.pushForNextRoute('crud.user.suggestion.success', 'success', {id : suggestion.$id()});
			$location.path('/suggestions');
		};

		$scope.onError = function(suggestion) {
			i18nNotifications.pushForCurrentRoute('crud.user.suggestion.error', 'error');
		};

		$scope.onRemove = function(suggestion) {
			i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : suggestion.$id()});
			$location.path('/suggestions');
		};
	}
]);