angular.module('users', [
  'users-list',
  'users-edit',
  'users-itemview',
  'services.crud',
  'security.authorization',
  'directives.gravatar'
])

.config([
	'crudRouteProvider',
	'securityAuthorizationProvider',
	function (crudRouteProvider, securityAuthorizationProvider) {

		var projectId = [
			'$route',
			function($route) {
				return $route.current.params.projectId;
			}
		];

		crudRouteProvider.routesFor('Users', 'projects', 'projects/:projectId')
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
	}
]);