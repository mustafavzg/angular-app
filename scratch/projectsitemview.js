angular.module('projectsitemview', [
	'ngRoute',
	'resources.projects',
	'resources.productbacklog',
	'resources.sprints',
	'resources.tasks',
	'resources.users',
	'services.crud',
	'ui.bootstrap',
	'security.authorization',
	'filters.pagination'
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

// 		crudRouteProvider.routesFor('Projects')
// 		.whenView({
// 			project:[
// 				'$route',
// 				'Projects',
// 				function ($route, Projects) {
// 					return Projects.getById($route.current.params.projectId);
// 				}
// 			]
// 			// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
// 			// users: getAllUsers,
// 			// adminUser: securityAuthorizationProvider.requireAdminUser
// 		});
// 	}
// ])

.config([
	'$routeProvider',
	'securityAuthorizationProvider',
	function (
		$routeProvider,
		securityAuthorizationProvider
	) {

		var getAllUsers = [
			'Projects',
			'Users',
			'$route',
			function(Projects, Users, $route){
				return Users.all();
			}
		];

		$routeProvider.when('/projects/new', {
			templateUrl:'projects/projects-edit.tpl.html',
			controller:'ProjectsEditCtrl',
			resolve:{
				project: ['Projects', function(Projects) { return new Projects(); }],
				users: getAllUsers
				// adminUser: securityAuthorizationProvider.requireAdminUser

				// project:[
				// 	'$route',
				// 	'Projects',
				// 	function ($route, Projects) {
				// 		return Projects.getById($route.current.params.projectId);
				// 	}
				// ]
				// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			}
		});

		$routeProvider.when('/projects/:projectId', {
			templateUrl:'projects/projects-itemview.tpl.html',
			controller:'ProjectsItemViewCtrl',
			resolve:{
				project:[
					'$route',
					'Projects',
					function ($route, Projects) {
						return Projects.getById($route.current.params.projectId);
					}
				]
				// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			}
		});

		$routeProvider.when('/projects/:projectId/view', {
			templateUrl:'projects/projects-itemview.tpl.html',
			controller:'ProjectsItemViewCtrl',
			resolve:{
				project:[
					'$route',
					'Projects',
					function ($route, Projects) {
						return Projects.getById($route.current.params.projectId);
					}
				]
				// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			}
		});

	}
])

.controller('ProjectsItemViewCtrl', [
	'$scope',
	'$location',
	'project',
	'ProductBacklog',
	'Sprints',
	'Tasks',
	'Users',
	'crudListMethods',
	'security',
	'$q',
	'filterFilter',
	'paginationFilter',
	function (
		$scope,
		$location,
		project,
		ProductBacklog,
		Sprints,
		Tasks,
		Users,
		crudListMethods,
		security,
		$q,
		filter,
		_paginationFilter_
	) {


		var paginationFilter = _paginationFilter_;
		// --------------------------------------------------

		// --------------------------------------------------

		$scope.project = project;

		$scope.projectscrudhelpers = {};
		angular.extend($scope.projectscrudhelpers, crudListMethods('/projects'));

		if( !angular.isDefined($scope.project.projectProfile) ){
			$scope.project.projectProfile = {
				ID : 1
				// name : 'hydra'
			};
		}

		$scope.project.attributesToDisplay = {
			projectprofile : {
				name : 'Project Profile',
				value : $scope.project.projectProfile.ID
			},
			priority : {
				name : 'Priority',
				value : project.priority
			},
			weight : {
				name : 'Weight',
				value : project.weight
			},
			startdate : {
				name : 'Start Date',
				value : project.startDate
			},
			enddate : {
				name : 'End Date',
				value : project.endDate
			}
		};

		/**************************************************
		 * Set the roles once we have the user
		 **************************************************/
		// $q.when(security.requestCurrentUser()).then(
		security.requestCurrentUser().then(
			function (currentUser) {
				if( angular.isDefined(currentUser) ){
					var userroles = project.getRoles(currentUser.id);
					$scope.project.attributesToDisplay.userroles = {
						name : 'Your Roles',
						value : userroles
					};
				}
			},
			function (response) {
				console.log("Failed to fetch project roles");
				console.log(response);
			}
		);

		/**************************************************
		 * Fetch the product owner name
		 **************************************************/
		// $q.when(Users.getById(project.productOwner)).then(
		// Users.getById(project.productOwner).then(
		// 	function (productOwner) {
		// 		var productOwnerName = productOwner.getFullName();
		// 		$scope.project.attributesToDisplay.productowner = {
		// 			name : 'Product Owner',
		// 			value : productOwnerName
		// 		};
		// 	},
		// 	function (response) {
		// 		console.log("Failed to fetch product owner");
		// 		console.log(response);
		// 	}
		// );

		Users.getById(
			project.productOwner,
			function (productOwner, responsestatus, responseheaders, responseconfig) {
				var productOwnerName = productOwner.getFullName();
				$scope.project.attributesToDisplay.productowner = {
					name : 'Product Owner',
					value : productOwnerName
				};
				console.log("Succeded to fetch product owner");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);

			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch product owner");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);

			}
		);

		/**************************************************
		 * Fetch the scrum master name
		 **************************************************/
		// $q.when(Users.getById(project.scrumMaster)).then(
		// Users.getById(project.scrumMaster).then(
		// 	function (scrumMaster) {
		// 		var scrumMasterName = scrumMaster.getFullName();
		// 		$scope.project.attributesToDisplay.scrummaster = {
		// 			name : 'Scrum Master',
		// 			value : scrumMasterName
		// 		};
		// 	},
		// 	function (response) {
		// 		console.log("Failed to fetch scrum master");
		// 		console.log(response);
		// 	}
		// );

		Users.getById(
			project.scrumMaster,
			function (scrumMaster, responsestatus, responseheaders, responseconfig) {
				var scrumMasterName = scrumMaster.getFullName();
				$scope.project.attributesToDisplay.scrummaster = {
					name : 'Scrum Master',
					value : scrumMasterName
				};
				console.log("Succeded to fetch scrum master");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch scrum master");
				console.log(response);
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			}
		);

		function getPageItems (currentPage, itemsPerPage, items) {
			var start = (currentPage - 1) * itemsPerPage;
			var end = start + itemsPerPage;
			console.log("start " + start);
			console.log("end " + end);
			return items.slice(start, end);
		}

		/**************************************************
		 * Fetch backlog items, setup pagination and crud helpers
		 **************************************************/
		$scope.fetchingbacklogitems = true;
		$scope.backlogitems = [];
		$scope.backlogitemsPaginate = {
			allitems : $scope.backlogitems,
			items : $scope.backlogitems,
			totalItems : 0,
			currentPage : 1,
			itemsPerPage : 4,
			paginate : function() {
				// var begin = (($scope.backlogitemsPaginate.currentPage - 1) * $scope.backlogitemsPaginate.itemsPerPage);
				// var end = begin + $scope.backlogitemsPaginate.itemsPerPage;
				// $scope.pagebacklogitems = $scope.backlogitems.slice(begin, end);
				console.log(this);
				// console.log(paginationFilter.toString());
				$scope.pagebacklogitems = paginationFilter(this.items, this.currentPage, this.itemsPerPage);
				// $scope.pagebacklogitems = getPageItems(this.currentPage, this.itemsPerPage, this.items);
			}
		};

		$scope.backlogitemsSort = {
			sortField : "priority",
			reverse : true,
			sort : function(fieldname) {
				console.log("sorting by " + fieldname);
				if( this.sortField === fieldname){
					this.reverse = !this.reverse;
					console.log("flipping by " + fieldname);
				}
				else {
					this.sortField = fieldname;
					this.reverse = false;
				}
			},
			isSortDown : function(fieldname) {
				return (this.sortField === fieldname) && this.reverse;
				console.log("is sort down " + fieldname);
			},
			isSortUp : function(fieldname) {
				return (this.sortField === fieldname) && !this.reverse;
				console.log("is sort up " + fieldname);
			}
		};

		// $scope.$watch('backlogquery', function(queryold, querynew) {
		// 	console.log("firing the search");
		// 	if( queryold !== querynew ){
		// 		console.log("firing the search");
		// 		$scope.backlogitemsPaginate.items = filter($scope.backlogitems, querynew);
		// 		$scope.backlogitemsPaginate.totalItems = $scope.backlogitemsPaginate.items.length;
		// 		$scope.backlogitemsPaginate.paginate();
		// 	}
		// });

		// $scope.$watch('backlogitemsPaginate.backlogquerydummy', function(queryold, querynew) {
		$scope.$watch('backlogitemsPaginate.backlogquerydummy', function(querynew, queryold) {
			console.log("firing the other search");
			console.log("null is null ? : " + (null === null));
			if( queryold !== querynew ){
				console.log("new string :" + querynew + "foo");
				console.log("doing the paginate");
				if( querynew === "" ){
					$scope.backlogitemsPaginate.items = $scope.backlogitemsPaginate.allitems;
				}
				else {
					$scope.backlogitemsPaginate.items = filter($scope.backlogitems, {name : querynew});
				}
				$scope.backlogitemsPaginate.totalItems = $scope.backlogitemsPaginate.items.length;
				$scope.backlogitemsPaginate.paginate();
			}
		});

		ProductBacklog.forProject(
			project.$id(),
			function (backlogitems, responsestatus, responseheaders, responseconfig) {
				$scope.backlogitems = backlogitems;
				$scope.backlogitemsPaginate.totalItems = $scope.backlogitems.length;
				$scope.backlogitemsPaginate.allitems = $scope.backlogitems;
				$scope.backlogitemsPaginate.items = $scope.backlogitems;
				// console.log("first");
				$scope.backlogitemsPaginate.paginate();
				$scope.fetchingbacklogitems = false;

				console.log("success results for backlog items");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch backlog items");
				console.log(response);
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			}
		);

		$scope.backlogitemscrudhelpers = {};
		angular.extend($scope.backlogitemscrudhelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));

		$scope.manageBacklog = function (project) {
			$location.path('/projects/'+project.$id()+'/productbacklog');
		};


		/**************************************************
		 * Fetch sprints and crud helpers
		 **************************************************/
		$scope.fetchingsprints = true;
		$scope.sprints = [];
		// Sprints.forProject(project.$id()).then(
		// 	function (sprints) {
		// 		$scope.sprints = sprints;
		// 		$scope.fetchingsprints = false;
		// 	},
		// 	function (response) {
		// 		console.log("Failed to fetch sprints");
		// 		console.log(response);
		// 	}
		// );

		Sprints.forProject(
			project.$id(),
			function (sprints, responsestatus, responseheaders, responseconfig) {
				$scope.sprints = sprints;
				$scope.fetchingsprints = false;
				console.log("success results for sprints");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch sprints");
				console.log(response);
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);
			}
		);

		$scope.sprintscrudhelpers = {};
		angular.extend($scope.sprintscrudhelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));
		$scope.sprintscrudhelpers.tasks = function (sprint, $event) {
			$event.stopPropagation();
			$location.path('/projects/'+project.$id()+'/sprints/'+sprint.$id()+'/tasks');
		};

		$scope.manageSprints = function (project) {
			$location.path('/projects/'+project.$id()+'/sprints');
		};

		/**************************************************
		 * Fetch tasks and crud helpers
		 **************************************************/
		$scope.fetchingtasks = true;
		$scope.tasks = [];

		// Tasks.forProject(project.$id()).then(
		// 	function (tasks, responsestatus, responseheaders, responseconfig) {
		// 		$scope.tasks = tasks;
		// 		$scope.fetchingtasks = false;
		// 		if( responsestatus === 405 ){
		// 			console.log("Failed to fetch tasks");
		// 			console.log(responseconfig);
		// 		}
		// 		console.log("success results for tasks");
		// 		console.log(responsestatus);
		// 		console.log(responseheaders);
		// 		console.log(responseconfig);
		// 	},
		// 	function (response, responsestatus, responseheaders, responseconfig) {
		// 		$scope.fetchingtasks = false;
		// 		console.log("Failed to fetch tasks");
		// 		console.log(response);
		// 		console.log(responsestatus);
		// 		console.log(responseheaders);
		// 		console.log(responseconfig);
		// 	}
		// );

		Tasks.forProject(
			project.$id(),
			function (tasks, responsestatus, responseheaders, responseconfig) {
				// if( responsestatus === 405 ){
				// 	console.log("Failed to fetch tasks");
				// 	console.log(responseconfig);
				// }

				$scope.tasks = tasks;
				$scope.fetchingtasks = false;
				console.log("success results for tasks");
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);

			},
			function (response, responsestatus, responseheaders, responseconfig) {
 				$scope.fetchingtasks = false;
				console.log("Failed to fetch tasks");
				console.log(response);
				console.log(responsestatus);
				console.log(responseheaders);
				console.log(responseconfig);

			}
		);

		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.manageTasks = function (project) {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		/**************************************************
		 * Fetch stake holders and crud helpers
		 **************************************************/
		$scope.fetchingStakeHolders = true;
		$scope.stakeHolders = [];
		Users.getByIds(
			project.stakeHolders,
			function (stakeHolders) {
				$scope.stakeHolders = stakeHolders;
				$scope.fetchingStakeHolders = false;
			},
			function (response) {
				console.log("Failed to fetch stake holders");
				console.log(response);
			}
		);
		$scope.stakeHolderscrudhelpers = {};
		angular.extend($scope.stakeHolderscrudhelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		// angular.extend($scope.stakeHolderscrudhelpers, crudListMethods('/users'));

		$scope.manageStakeHolders = function (project) {
			$location.path('/projects/'+project.$id()+'/edit');
		};


		/**************************************************
		 * Fetch team members and crud helpers
		 **************************************************/
		$scope.fetchingTeamMembers = true;
		$scope.teamMembers = [];
		Users.getByIds(
			project.teamMembers,
			function (teamMembers) {
				$scope.teamMembers = teamMembers;
				$scope.fetchingTeamMembers = false;
			},
			function (response) {
				console.log("Failed to fetch team members");
				console.log(response);
			}
		);
		$scope.teammemberscrudhelpers = {};
		angular.extend($scope.teammemberscrudhelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		// angular.extend($scope.teammemberscrudhelpers, crudListMethods('/users'));

		$scope.manageTeamMembers = function (project) {
			$location.path('/projects/'+project.$id()+'/edit');
		};

	}
]);
