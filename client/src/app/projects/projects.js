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
			users: getAllUsers,
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
	'users',
	'project',
	'crudListMethods',
	'_',
	function($scope, $location, i18nNotifications, users, project, crudListMethods, _) {

		$scope.project = project;
		$scope.users = users;
		if( !angular.isDefined($scope.project.projectProfile) ){
			$scope.project.projectProfile = {
				ID : 1
				// name : 'hydra'
			};
		}

		$scope.projectscrudhelpers = {};
		angular.extend($scope.projectscrudhelpers, crudListMethods('/projects'));

		$scope.onSave = function(project) {
			i18nNotifications.pushForNextRoute('crud.project.save.success', 'success', {id : project.$id()});
			$location.path('/projects/' + project.$id());
		};

		$scope.onError = function() {
			i18nNotifications.pushForCurrentRoute('crud.project.save.error', 'error');
		};

	}
])

.controller('TeamMembersController', [
	'$scope',
	'Users',
	'_',
	function($scope, Users, _) {
		$scope.project.teamMembers = $scope.project.teamMembers || [];
		$scope.project.stakeHolders = $scope.project.stakeHolders || [];
		$scope.project.productOwner = $scope.project.productOwner || undefined;
		$scope.project.scrumMaster = $scope.project.scrumMaster || undefined;

		var updateProjectListForUsers = function (newUserId, prevUserId, projectList) {

			// Add the project to the users list of projects
			if( angular.isDefined(newUserId) ){
				var user = $scope.usersLookup[newUserId];
				if( !angular.isArray(user[projectList]) ){
					user[projectList] = [];
				}
				user[projectList].push($scope.project.$id());
				console.log("added project to the " + projectList);
				console.log(user[projectList]);
			}

			// Remove the project from the users list of projects
			if( angular.isDefined(prevUserId) ){
				var user = $scope.usersLookup[prevUserId];
				if( angular.isArray(user[projectList]) ){
					var projectidx = user[projectList].indexOf($scope.project.$id());
					if(projectidx >= 0) {
						user[projectList].splice(projectidx, 1);
					}
					console.log("removed project from the "+ projectList);
					console.log(user[projectList]);
				}
			}
		};

		// clear the project from the old user and add it to the new user
		$scope.$watch('project.scrumMaster', function (newScrumMaster, oldScrumMaster) {
			if( newScrumMaster !== oldScrumMaster ){
				updateProjectListForUsers(newScrumMaster, oldScrumMaster, 'scrumMasterOfProjects');
			}
		});
		$scope.$watch('project.productOwner', function (newProductOwner, oldProductOwner) {
			if( newProductOwner !== oldProductOwner ){
				updateProjectListForUsers(newProductOwner, oldProductOwner, 'productOwnerOfProjects');
			}
		});

		//prepare users lookup, just keep references for easier lookup
		$scope.usersLookup = {};
		$scope.buildLookUp = function (users) {
			angular.forEach(users, function(value, key) {
				$scope.usersLookup[value.$id()] = value;
			});
		};
		// $scope.buildLookUp($scope.users);
		// $scope.user = $scope.users[0];

		$scope.productOwnerCandidates = function() {
			return $scope.users.filter(
				function(user) {
					return $scope.usersLookup[user.$id()] && $scope.project.canActAsProductOwner(user.$id());
				}
			);
		};

		$scope.scrumMasterCandidates = function() {
			return $scope.users.filter(
				function(user) {
					return $scope.usersLookup[user.$id()] && $scope.project.canActAsScrumMaster(user.$id());
				}
			);
		};

		// $scope.teamMemberCandidates = function() {
		// 	return $scope.users.filter(
		// 		function(user) {
		// 			return $scope.usersLookup[user.$id()] && $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
		// 		}
		// 	);
		// };

		// $scope.teamMemberCandidates = function(users) {
		// 	return users.filter(
		// 		function(user) {
		// 			return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
		// 		}
		// 	);
		// };

		// $scope.teamMemberAlready = function(users) {
		// 	return users.filter(
		// 		function(user) {
		// 			return $scope.project.isDevTeamMember(user.$id());
		// 		}
		// 	);
		// };

		$scope.possibleTeamMemberFilter = function(user) {
			return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
		};

		$scope.isTeamMemberFilter = function(user) {
			return $scope.project.isDevTeamMember(user.$id());
		};

		$scope.addMember = function(user, list) {
			console.log("adding member");
			var userId = user.$id();
			list.push(userId);
			console.log($scope.project.teamMembers);
			// updateProjectListForUsers(userId, undefined, projectRole);
		};

		$scope.removeMember = function(user, list) {
			// Remove the user from the team members list
			var userId = user.$id();
			var idx = list.indexOf(userId);
			if(idx >= 0) {
				list.splice(idx, 1);
			}
			// Remove the project from the list of projects of the user
			// updateProjectListForUsers(undefined, userId, projectRole);
		};

		$scope.addTeamMember = function(user) {
			console.log("adding team member");
			var userId = user.$id();
			$scope.project.teamMembers.push(userId);
			console.log($scope.project.teamMembers);
			updateProjectListForUsers(userId, undefined, 'teamMemberOfProjects');
		};

		$scope.removeTeamMember = function(teamMember) {
			// Remove the user from the team members list
			var teamMemberId = teamMember.$id();
			var idx = $scope.project.teamMembers.indexOf(teamMemberId);
			if(idx >= 0) {
				$scope.project.teamMembers.splice(idx, 1);
			}
			// Remove the project from the list of projects of the user
			updateProjectListForUsers(undefined, teamMemberId, 'teamMemberOfProjects');
		};

		$scope.possibleStakeHolderFilter = function(user) {
			return $scope.project.canActAsStakeHolder(user.$id()) && !$scope.project.isStakeHolder(user.$id());
		};

		$scope.isStakeHolderFilter = function(user) {
			return $scope.project.isStakeHolder(user.$id());
		};

		// $scope.selStakeHolder = undefined;

		// $scope.stakeHolderCandidates = function() {
		// 	return $scope.users.filter(
		// 		function(user) {
		// 			return $scope.usersLookup[user.$id()] && $scope.project.canActAsStakeHolder(user.$id()) && !$scope.project.isStakeHolder(user.$id());
		// 		}
		// 	);
		// };

		$scope.addStakeHolder = function(user) {
			console.log("adding stake holder");
			var userId = user.$id();
			$scope.project.stakeHolders.push(userId);
			console.log($scope.project.stakeHolders);
			updateProjectListForUsers(userId, undefined, 'stakeHolderOfProjects');
		};

		$scope.removeStakeHolder = function(stakeHolder) {
			// Remove the user from the stake holders list
			var stakeHolderId = stakeHolder.$id();
			var idx = $scope.project.stakeHolders.indexOf(stakeHolderId);
			if(idx >= 0) {
				$scope.project.stakeHolders.splice(idx, 1);
			}

			// Remove the project from the list of projects of the user
			updateProjectListForUsers(undefined, stakeHolderId, 'stakeHolderOfProjects');
		};

	}
])
;
