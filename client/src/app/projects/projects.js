
angular.module('projects', [
	'resources.projects',
	'resources.users',
	'projectsitemview',
	'productbacklog',
	'sprints',
	'tasksnew',
	'users',
	'directives.datelookup',
	'directives.datecombofromto',
	'directives.helptip',
	'directives.userthumb',
	'directives.findusers',
	'directives.users',
	'directives.userscombosearchadd',
	'directives.icon',
	'directives.actionicon',
	'directives.test',
	'services.crud',
	'security.authorization',
	'services.i18nNotifications',
	'underscore'
])

.config([
	'crudRouteProvider',
	'securityAuthorizationProvider',
	function (crudRouteProvider, securityAuthorizationProvider) {

		var getAllUsers = [
			'Projects',
			'Users',
			'$route',
			function(Projects, Users, $route){
				return Users.all();
			}
		];

		crudRouteProvider.routesFor('Projects')
		.whenList({
			projects: ['Projects', function(Projects) { return Projects.all(); }]
			// adminUser: securityAuthorizationProvider.requireAdminUser
		})
		.whenNew({
			project: ['Projects', function(Projects) { return new Projects(); }],
			users: getAllUsers,
			adminUser: securityAuthorizationProvider.requireAdminUser
		})
		// project is not getting assigned, need to figure out why
		// .whenView({
		// 	project:[
		// 		'$route',
		// 		'Projects',
		// 		function ($route, Projects) {
		// 			return Projects.getById($route.current.params.projectId);
		// 		}
		// 	]
		// 	// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
		// 	// users: getAllUsers,
		// 	// adminUser: securityAuthorizationProvider.requireAdminUser
		// })
		.whenEdit({
			project: [
				'Projects',
				'Users',
				'$route',
				function(Projects, Users, $route) {
					return Projects.getById($route.current.params.itemId);
				}
			],
			// users: getAllUsers,
			adminUser: securityAuthorizationProvider.requireAdminUser
		});
	}
])

// .config([
// 	'$routeProvider',
// 	'securityAuthorizationProvider',
// 	function (
// 		$routeProvider,
// 		securityAuthorizationProvider
// 	) {
// 		$routeProvider.when('/projects', {
// 			templateUrl:'projects/projects-list.tpl.html',
// 			controller:'ProjectsListCtrl',
// 			resolve:{
// 				projects:[
// 					'Projects',
// 					function (Projects) {
// 						//TODO: fetch only for the current user
// 						return Projects.all();
// 					}
// 				]
// 				// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
// 			}
// 		});
// 	}
// ])

.controller('ProjectsListCtrl', [
	'$scope',
	'$location',
	'projects',
	'Projects',
	'security',
	'crudListMethods',
	'$q',
	function (
		$scope,
		$location,
		projects,
		Projects,
		security,
		crudListMethods,
		$q
	) {
		$scope.projects = projects;
		console.log(projects);
		security.requestCurrentUser();

		angular.extend($scope, crudListMethods('/projects'));

		// /**************************************************
		//  * Set the roles once we have the user
		//  **************************************************/
		// $q.when(security.requestCurrentUser()).then(
		// 	function (currentUser) {
		// 		Projects.forUser(currentUser.id).then(
		// 			function (projects) {
		// 				$scope.projects2 = projects;
		// 				console.log("User projects are");
		// 				console.log($scope.projects2);
		// 			}
		// 		);
		// 	}
		// );

		$scope.viewProject = function (project) {
			console.log('view is being called');
			$location.path('/projects/'+project.$id());
		};

		$scope.manageBacklog = function (project) {
			$location.path('/projects/'+project.$id()+'/productbacklog');
		};

		$scope.manageSprints = function (project) {
			$location.path('/projects/'+project.$id()+'/sprints');
		};

		$scope.getMyRoles = function(project) {
			if ( security.currentUser ) {
				return project.getRoles(security.currentUser.id);
			}
		};
	}
])

.controller('ProjectsEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	// 'users',
	'project',
	'crudListMethods',
	'crudEditHandlers',
	'_',
	function($scope, $location, i18nNotifications, project, crudListMethods, crudEditHandlers, _) {
	// function($scope, $location, i18nNotifications, users, project, crudListMethods, _) {

		$scope.project = project;
		// $scope.users = users;
		if( !angular.isDefined($scope.project.projectProfile) ){
			$scope.project.projectProfile = {
				ID : 1
				// name : 'hydra'
			};
		}

		$scope.projectscrudhelpers = {};
		angular.extend($scope.projectscrudhelpers, crudListMethods('/projects'));
		angular.extend($scope, crudEditHandlers('project'));

		// $scope.onSave = function(savedProject) {
		// 	return {
		// 		key: 'crud.project.save.success',
		// 		type: 'success',
		// 		context: {id : savedProject.$id()}
		// 	};

		// 	// i18nNotifications.pushForNextRoute('crud.project.save.success', 'success', {id : project.$id()});
		// 	// $location.path('/projects/' + project.$id());
		// 	// var projectId = project.$id();
		// 	// if( angular.isDefined(projectId) ){
		// 	// 	$location.path('/projects/' + projectId);
		// 	// }
		// 	// else {
		// 	// 	$location.path('/projects/');
		// 	// }
		// };

		// $scope.onSaveError = function(error) {
		// 	return {
		// 		key: 'crud.project.save.error',
		// 		type: 'error',
		// 		context: {
		// 			error: error
		// 		}
		// 	};
		// };

	}
])

.controller('TeamMembersController', [
	'$scope',
	'Users',
	'_',
	function($scope, Users, _) {
		$scope.project.teamMembers = $scope.project.teamMembers || [];
		$scope.project.stakeHolders = $scope.project.stakeHolders || [];

		// keeping productOwner/scrumMaster in a list to use the users search combo widget
		$scope.productOwners = (angular.isDefined($scope.project.productOwner)) ? [$scope.project.productOwner] : [];
		$scope.scrumMasters = (angular.isDefined($scope.project.scrumMaster)) ? [$scope.project.scrumMaster] : [];

		//prepare users lookup, just keep references for easier lookup
		$scope.usersLookup = {};
		$scope.buildLookUp = function (users) {
			angular.forEach(users, function(value, key) {
				$scope.usersLookup[value.$id()] = value;
			});
		};
		// $scope.buildLookUp($scope.users);
		// $scope.user = $scope.users[0];

		// Team Members
		$scope.possibleTeamMemberFilter = function(user) {
			return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
		};

		$scope.isTeamMemberFilter = function(user) {
			return $scope.project.isDevTeamMember(user.$id());
		};

		// Stake Holders
		$scope.possibleStakeHolderFilter = function(user) {
			return $scope.project.canActAsStakeHolder(user.$id()) && !$scope.project.isStakeHolder(user.$id());
		};

		$scope.isStakeHolderFilter = function(user) {
			return $scope.project.isStakeHolder(user.$id());
		};

		// Product Owner
		$scope.$watchCollection('productOwners', function (newProductOwner, oldProductOwner) {
			if( !angular.equals(newProductOwner, oldProductOwner) ){
				$scope.project.productOwner = newProductOwner[0];
			}
		});

		$scope.possibleProductOwnerFilter = function(user) {
			return $scope.project.canActAsProductOwner(user.$id()) && !$scope.project.isProductOwner(user.$id());
		};

		$scope.isProductOwnerFilter = function(user) {
			return $scope.project.isProductOwner(user.$id());
		};

		// Scrum Master
		$scope.$watchCollection('scrumMasters', function (newScrumMaster, oldScrumMaster) {
			if( !angular.equals(newScrumMaster, oldScrumMaster) ){
				$scope.project.scrumMaster = newScrumMaster[0];
			}
		});

		$scope.possibleScrumMasterFilter = function(user) {
			return $scope.project.canActAsScrumMaster(user.$id()) && !$scope.project.isScrumMaster(user.$id());
		};

		$scope.isScrumMasterFilter = function(user) {
			return $scope.project.isScrumMaster(user.$id());
		};

	}
])
;
