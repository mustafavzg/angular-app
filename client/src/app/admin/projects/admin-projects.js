angular.module('admin-projects', [
	'resources.projects',
	'resources.users',
	'services.crud',
	'security.authorization'
])

// .config([
// 	'crudRouteProvider',
// 	'securityAuthorizationProvider',
// 	function (crudRouteProvider, securityAuthorizationProvider) {

// 		var getAllUsers = [
// 			'Projects',
// 			'Users',
// 			'$route',
// 			function(Projects, Users, $route){
// 				return Users.all();
// 			}
// 		];

// 		crudRouteProvider.routesFor('Projects', 'admin')
// 		.whenList({
// 			projects: ['Projects', function(Projects) { return Projects.all(); }],
// 			adminUser: securityAuthorizationProvider.requireAdminUser
// 		})
// 		.whenNew({
// 			project: ['Projects', function(Projects) { return new Projects(); }],
// 			users: getAllUsers,
// 			adminUser: securityAuthorizationProvider.requireAdminUser
// 		})
// 		.whenEdit({
// 			project: [
// 				'Projects',
// 				'Users',
// 				'$route',
// 				function(Projects, Users, $route) {
// 					return Projects.getById($route.current.params.itemId);
// 				}
// 			],
// 			users: getAllUsers,
// 			adminUser: securityAuthorizationProvider.requireAdminUser
// 		});
// 	}
// ])

// .controller('ProjectsListCtrl', [
// 	'$scope',
// 	'crudListMethods',
// 	'projects',
// 	function($scope, crudListMethods, projects) {
// 		$scope.projects = projects;
// 		angular.extend($scope, crudListMethods('/admin/projects'));
// 	}
// ])

// .controller('ProjectsEditCtrl', [
// 	'$scope',
// 	'$location',
// 	'i18nNotifications',
// 	'users',
// 	'project',
// 	function($scope, $location, i18nNotifications, users, project) {

// 		$scope.project = project;
// 		$scope.users = users;

// 		$scope.onSave = function(project) {
// 			i18nNotifications.pushForNextRoute('crud.project.save.success', 'success', {id : project.$id()});
// 			$location.path('/projects/' + project.$id());
// 		};

// 		$scope.onError = function() {
// 			i18nNotifications.pushForCurrentRoute('crud.project.save.error', 'error');
// 		};

// 	}
// ])

// .controller('TeamMembersController', [
// 	'$scope',
// 	function($scope) {
// 		$scope.project.teamMembers = $scope.project.teamMembers || [];
// 		$scope.project.stakeHolders = $scope.project.stakeHolders || [];
// 		$scope.project.productOwner = $scope.project.productOwner || undefined;
// 		$scope.project.scrumMaster = $scope.project.scrumMaster || undefined;

// 		var updateProjectListForUsers = function (newUserId, prevUserId, projectList) {

// 			// Add the project to the users list of projects
// 			if( angular.isDefined(newUserId) ){
// 				var user = $scope.usersLookup[newUserId];
// 				if( !angular.isArray(user[projectList]) ){
// 					user[projectList] = [];
// 				}
// 				user[projectList].push($scope.project.$id());
// 				console.log("added project to the " + projectList);
// 				console.log(user[projectList]);
// 			}

// 			// Remove the project from the users list of projects
// 			if( angular.isDefined(prevUserId) ){
// 				var user = $scope.usersLookup[prevUserId];
// 				if( angular.isArray(user[projectList]) ){
// 					var projectidx = user[projectList].indexOf($scope.project.$id());
// 					if(projectidx >= 0) {
// 						user[projectList].splice(projectidx, 1);
// 					}
// 					console.log("removed project from the "+ projectList);
// 					console.log(user[projectList]);
// 				}
// 			}
// 		};

// 		// clear the project from the old user and add it to the new user
// 		$scope.$watch('project.scrumMaster', function (newScrumMaster, oldScrumMaster) {
// 			if( newScrumMaster !== oldScrumMaster ){
// 				updateProjectListForUsers(newScrumMaster, oldScrumMaster, 'scrumMasterOfProjects');
// 			}
// 		});
// 		$scope.$watch('project.productOwner', function (newProductOwner, oldProductOwner) {
// 			if( newProductOwner !== oldProductOwner ){
// 				updateProjectListForUsers(newProductOwner, oldProductOwner, 'productOwnerOfProjects');
// 			}
// 		});

// 		//prepare users lookup, just keep references for easier lookup
// 		$scope.usersLookup = {};
// 		angular.forEach($scope.users, function(value, key) {
// 			$scope.usersLookup[value.$id()] = value;
// 		});

// 		$scope.productOwnerCandidates = function() {
// 			return $scope.users.filter(
// 				function(user) {
// 					return $scope.usersLookup[user.$id()] && $scope.project.canActAsProductOwner(user.$id());
// 				}
// 			);
// 		};

// 		$scope.scrumMasterCandidates = function() {
// 			return $scope.users.filter(
// 				function(user) {
// 					return $scope.usersLookup[user.$id()] && $scope.project.canActAsScrumMaster(user.$id());
// 				}
// 			);
// 		};

// 		$scope.teamMemberCandidates = function() {
// 			return $scope.users.filter(
// 				function(user) {
// 					return $scope.usersLookup[user.$id()] && $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
// 				}
// 			);
// 		};

// 		$scope.stakeHolderCandidates = function() {
// 			return $scope.users.filter(
// 				function(user) {
// 					return $scope.usersLookup[user.$id()] && $scope.project.canActAsStakeHolder(user.$id()) && !$scope.project.isStakeHolder(user.$id());
// 				}
// 			);
// 		};

// 		$scope.selTeamMember = undefined;

// 		$scope.addTeamMember = function() {
// 			if($scope.selTeamMember) {
// 				// add the user as team member
// 				$scope.project.teamMembers.push($scope.selTeamMember);

// 				// add the project to the users list of projects
// 				updateProjectListForUsers($scope.selTeamMember, undefined, 'teamMemberOfProjects');

// 				// clear the selected value
// 				$scope.selTeamMember = undefined;
// 			}
// 		};

// 		$scope.removeTeamMember = function(teamMember) {
// 			// remove the user from the team members list
// 			var idx = $scope.project.teamMembers.indexOf(teamMember);
// 			if(idx >= 0) {
// 				$scope.project.teamMembers.splice(idx, 1);
// 			}

// 			// Remove the project from the list of projects of the user
// 			updateProjectListForUsers(undefined, teamMember, 'teamMemberOfProjects');

// 			// If we have removed the team member that is currently selected
// 			// then clear this object
// 			if($scope.selTeamMember === teamMember) {
// 				$scope.selTeamMember = undefined;
// 			}
// 		};


// 		$scope.selStakeHolder = undefined;

// 		$scope.addStakeHolder = function() {
// 			if($scope.selStakeHolder) {
// 				// add the user as stake holder
// 				$scope.project.stakeHolders.push($scope.selStakeHolder);

// 				// add the project to the users list of projects
// 				updateProjectListForUsers($scope.selStakeHolder, undefined, 'stakeHolderOfProjects');

// 				// clear the selected value
// 				$scope.selStakeHolder = undefined;
// 			}
// 		};

// 		$scope.removeStakeHolder = function(stakeHolder) {
// 			// remove the user from the stake holders list
// 			var idx = $scope.project.stakeHolders.indexOf(stakeHolder);
// 			if(idx >= 0) {
// 				$scope.project.stakeHolders.splice(idx, 1);
// 			}

// 			// Remove the project from the list of projects of the user
// 			updateProjectListForUsers(undefined, stakeHolder, 'stakeHolderOfProjects');

// 			// If we have removed the stake holder that is currently selected
// 			// then clear this object
// 			if($scope.selStakeHolder === stakeHolder) {
// 				$scope.selStakeHolder = undefined;
// 			}
// 		};

// 	}
// ]);