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
		angular.forEach($scope.users, function(value, key) {
			$scope.usersLookup[value.$id()] = value;
		});

		// $scope.hello = function (msg) {
		// 	return msg;
		// };

		$scope.getUsers = function (usersIdList) {
			return _.map(usersIdList, function (userId) {
				return $scope.usersLookup[userId];
			});
		};

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

		$scope.possibleTeamMemberFilter = function(user) {
			return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
		};

		$scope.isTeamMemberFilter = function(user) {
			return $scope.project.isDevTeamMember(user.$id());
		};

		$scope.teamMemberCandidates = function(users) {
			return users.filter(
				function(user) {
					return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
				}
			);
		};

		$scope.teamMemberAlready = function(users) {
			return users.filter(
				function(user) {
					return $scope.project.isDevTeamMember(user.$id());
				}
			);
		};

		$scope.teamMemberAutocomplete = [];
		// $scope.getCandidatesByName = function(query) {
		// 	// return Users.autocomplete(
		// 	Users.autocomplete(
		// 		query,
		// 		function (users) {
		// 			console.log("Succeeded to fetch users for typeahead");
		// 			$scope.teamMemberAutocomplete = users;
		// 			// return users;
		// 		},
		// 		function (response) {
		// 			console.log("Failed to fetch users for typeahead");
		// 		}
		// 	);
		// };

		// $scope = {};
		$scope.noUsersFound = false;

		$scope.getCandidatesByName = function(query) {
			console.log("calling GETCANDIDATES BY NAME");
			$scope.noUsersFound = false;
			console.log($scope.noUsersFound);
			$scope.getCandidatesByNameDeb(query);
			// return Users.autocomplete(
			// if( angular.isDefined(query) ){
		};


		// $scope.getCandidatesByName = function(query) {
		// 	console.log("calling GETCANDIDATES BY NAME");
		// 	$scope.noUsersFound = false;
		// 	console.log($scope.noUsersFound);
		// 	// return Users.autocomplete(
		// 	// if( angular.isDefined(query) ){
		// 	if( query !== "" ){
		// 		console.log("fetching user for GETCANDIDATES BY NAME for query: '" + query + "'");
		// 		$scope.loadingUsers = true;
		// 		Users.autocomplete(
		// 			query,
		// 			function (users) {
		// 				console.log("Succeeded to fetch users for typeahead");
		// 				$scope.teamMemberAutocomplete = users;
		// 				// return users;
		// 				$scope.loadingUsers = false;
		// 				if( !users.length ){
		// 					$scope.noUsersFound = true;
		// 				}
		// 			},
		// 			function (response) {
		// 				console.log("Failed to fetch users for typeahead");
		// 				$scope.loadingUsers = false;
		// 			}
		// 		);
		// 	}
		// };

		$scope.getCandidatesByNameDeb = _.debounce(
			function(query) {
				console.log("calling GETCANDIDATES BY NAME DEBOUNcED");
				// $scope.noUsersFound = false;
				// console.log($scope.noUsersFound);
				// return Users.autocomplete(
				// if( angular.isDefined(query) ){
				if( query !== "" ){
					console.log("fetching user for GETCANDIDATES BY NAME for query: '" + query + "'");
					$scope.loadingUsers = true;
					Users.autocomplete(
						query,
						function (users) {
							console.log("Succeeded to fetch users for typeahead");
							$scope.teamMemberAutocomplete = users;
							// return users;
							$scope.loadingUsers = false;
							if( !users.length ){
								$scope.noUsersFound = true;
							}
						},
						function (response) {
							console.log("Failed to fetch users for typeahead");
							$scope.loadingUsers = false;
						}
					);
				}
			},
			500
		);

		$scope.onSelect = function ($item, $model, $label) {
			$scope.loadingUsers = 'false';
			$scope.teamMemberAutocomplete = [$item];
			// $scope.$item = $item;
			// $scope.$model = $model;
			// $scope.$label = $label;
		};

		$scope.stakeHolderCandidates = function() {
			return $scope.users.filter(
				function(user) {
					return $scope.usersLookup[user.$id()] && $scope.project.canActAsStakeHolder(user.$id()) && !$scope.project.isStakeHolder(user.$id());
				}
			);
		};

		$scope.selTeamMember = undefined;

		$scope.addTeamMember = function(user) {
			if($scope.selTeamMember) {
				// add the user as team member
				$scope.project.teamMembers.push($scope.selTeamMember);

				// add the project to the users list of projects
				updateProjectListForUsers($scope.selTeamMember, undefined, 'teamMemberOfProjects');

				// clear the selected value
				$scope.selTeamMember = undefined;
			}
			console.log("adding team member");
			// $scope.selTeamMember = userid;
			$scope.project.teamMembers.push(user.$id());
			console.log($scope.project.teamMembers);
			updateProjectListForUsers(user.$id(), undefined, 'teamMemberOfProjects');
		};

		$scope.removeTeamMember = function(teamMember) {
			// remove the user from the team members list
			var idx = $scope.project.teamMembers.indexOf(teamMember.$id());
			if(idx >= 0) {
				$scope.project.teamMembers.splice(idx, 1);
			}

			// Remove the project from the list of projects of the user
			updateProjectListForUsers(undefined, teamMember.$id(), 'teamMemberOfProjects');

			// If we have removed the team member that is currently selected
			// then clear this object
			if($scope.selTeamMember === teamMember.$id()) {
				$scope.selTeamMember = undefined;
			}
		};


		$scope.selStakeHolder = undefined;

		$scope.addStakeHolder = function(userid) {
			if($scope.selStakeHolder) {
				// add the user as stake holder
				$scope.project.stakeHolders.push($scope.selStakeHolder);

				// add the project to the users list of projects
				updateProjectListForUsers($scope.selStakeHolder, undefined, 'stakeHolderOfProjects');

				// clear the selected value
				$scope.selStakeHolder = undefined;
			}
			console.log("adding stake holder");
			// $scope.selStakeHolder = userid;
			$scope.project.stakeHolders.push(userid);
			console.log($scope.project.stakeHolders);
			updateProjectListForUsers(userid, undefined, 'stakeHolderOfProjects');
		};

		$scope.removeStakeHolder = function(stakeHolder) {
			// remove the user from the stake holders list
			var idx = $scope.project.stakeHolders.indexOf(stakeHolder);
			if(idx >= 0) {
				$scope.project.stakeHolders.splice(idx, 1);
			}

			// Remove the project from the list of projects of the user
			updateProjectListForUsers(undefined, stakeHolder, 'stakeHolderOfProjects');

			// If we have removed the stake holder that is currently selected
			// then clear this object
			if($scope.selStakeHolder === stakeHolder) {
				$scope.selStakeHolder = undefined;
			}
		};

	}
])
;
