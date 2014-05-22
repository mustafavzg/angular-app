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
	'filters.pagination',
	'directives.tableactive',
	'directives.test',
	'directives.users',
	'underscore'
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
	'_',
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
		paginationFilter,
		_
	) {
		$scope.project = project;

		$scope.projectsCrudHelpers = {};
		angular.extend($scope.projectsCrudHelpers, crudListMethods('/projects'));

		if( !angular.isDefined($scope.project.projectProfile) ){
			$scope.project.projectProfile = {
				ID : 1
				// name : 'hydra'
			};
		}

		$scope.project.attributesToDisplay = {
			priority : {
				name : 'Priority',
				value : project.priority,
				ordering : 1
			},
			weight : {
				name : 'Weight',
				value : project.weight,
				ordering : 2
			},
			startdate : {
				name : 'Start Date',
				value : project.startDate,
				ordering : 3
			},
			enddate : {
				name : 'End Date',
				value : project.endDate,
				ordering : 4
			},
			projectprofile : {
				name : 'Project Profile',
				value : $scope.project.projectProfile.ID,
				ordering : 5
			}
		};

		$scope.project.attributeValuesToDisplay = _.values($scope.project.attributesToDisplay);

		$scope.$watchCollection('project.attributesToDisplay', function (newObj, oldObj) {
			// Check equality just to be sure, as listeners are fired atleast
			// once during initialization even if the object has not changed
			if( !angular.equals(newObj, oldObj) ){
				$scope.project.attributeValuesToDisplay = _.values($scope.project.attributesToDisplay);
			}
		});

		/**************************************************
		 * Set the roles once we have the user
		 **************************************************/
		// Commenting this for now until we need the currentUser
		// $q.when(security.requestCurrentUser()).then(
		// security.requestCurrentUser().then(
		// 	function (currentUser) {
		// 		if( angular.isDefined(currentUser) ){
		// 			var userroles = project.getUserRoles(currentUser.id);
		// 			$scope.project.attributesToDisplay.userroles = {
		// 				name : 'Your Roles',
		// 				value : userroles,
		// 				ordering : 6
		// 			};
		// 		}
		// 	},
		// 	function (response) {
		// 		console.log("Failed to fetch project roles");
		// 		console.log(response);
		// 	}
		// );

		/**************************************************
		 * Fetch the product owner name
		 **************************************************/
		$scope.fetchingProductOwner = true;
		Users.getById(
			project.productOwner,
			function (productOwner, responsestatus, responseheaders, responseconfig) {
				$scope.productOwner = productOwner;
				$scope.fetchingProductOwner = false;
				var productOwnerName = productOwner.getFullName();
				$scope.project.attributesToDisplay.productowner = {
					name : 'Product Owner',
					value : productOwnerName,
					glyphiconclass : 'glyphicon glyphicon-user',
					ordering : 7
				};
				console.log("Succeded to fetch product owner");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				$scope.fetchingProductOwner = false;
				console.log("Failed to fetch product owner");
				console.log(response);
			}
		);

		/**************************************************
		 * Fetch the scrum master name
		 **************************************************/
		$scope.fetchingScrumMaster = true;
		Users.getById(
			project.scrumMaster,
			function (scrumMaster, responsestatus, responseheaders, responseconfig) {
				$scope.fetchingScrumMaster = false;
				$scope.scrumMaster = scrumMaster;
				var scrumMasterName = scrumMaster.getFullName();
				$scope.project.attributesToDisplay.scrummaster = {
					name : 'Scrum Master',
					value : scrumMasterName,
					glyphiconclass : 'glyphicon glyphicon-user',
					ordering : 8
				};
				console.log("Succeded to fetch scrum master");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				$scope.fetchingScrumMaster = false;
				console.log("Failed to fetch scrum master");
				console.log(response);
			}
		);

		/**************************************************
		 * Fetch backlog items
		 **************************************************/
		$scope.fetchingBacklogItems = true;
		$scope.backlogItems = [];
		$scope.backlogItemsCrudHelpers = {};
		angular.extend($scope.backlogItemsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));

		$scope.manageBacklog = function () {
			$location.path('/projects/'+project.$id()+'/productbacklog');
		};

		ProductBacklog.forProject(
			project.$id(),
			function (backlogItems, responsestatus, responseheaders, responseconfig) {
				$scope.backlogItems = backlogItems;
				$scope.fetchingBacklogItems = false;
				console.log("Succeeded to fetch backlog items");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch backlog items");
				$scope.fetchingBacklogItems = false;
				console.log(response);
			}
		);

		$scope.backlogItemsConf = {
			resource : {
				key : 'productbacklog',
				prettyName : 'Product Backlog',
				altPrettyName : 'Backlog Items',
				link : $scope.manageBacklog,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.backlogItemsCrudHelpers
			},
			pagination : {
				currentPage : 1,
				itemsPerPage : 10
			},
			sortinit : {
				fieldKey : 'priority',
				reverse : true
			},
			tableColumns : [
				{
					key : 'name',
					prettyName : 'Name',
					widthClass : 'col-md-2'
				},
				{
					key : 'desc',
					prettyName : 'Description',
					widthClass : 'col-md-4'
				},
				{
					key : 'priority',
					prettyName : 'Priority',
					widthClass : 'col-md-1'
				},
				{
					key : 'estimation',
					prettyName : 'Estimation',
					widthClass : 'col-md-1'
				}
			]
		};


		/**************************************************
		 * Fetch sprints
		 **************************************************/
		$scope.fetchingSprints = true;
		$scope.sprints = [];

		$scope.sprintsCrudHelpers = {};
		angular.extend($scope.sprintsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));

		$scope.manageSprints = function () {
			$location.path('/projects/'+project.$id()+'/sprints');
		};

		Sprints.forProject(
			project.$id(),
			function (sprints, responsestatus, responseheaders, responseconfig) {
				$scope.sprints = sprints;
				$scope.fetchingSprints = false;
				console.log("Succeeded to fetch sprints");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				console.log("Failed to fetch sprints");
				console.log(response);
			}
		);

		$scope.sprintsConf = {
			resource : {
				key : 'sprints',
				prettyName : 'Sprints',
				altPrettyName : 'Sprints',
				link : $scope.manageSprints,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.sprintsCrudHelpers
			},
			pagination : {
				currentPage : 1,
				itemsPerPage : 10
			},
			sortinit : {
				fieldKey : 'name',
				reverse : false
			},
			tableColumns : [
				{
					key : 'name',
					prettyName : 'Name',
					widthClass : 'col-md-2'
				},
				{
					key : 'start',
					prettyName : 'Start Date',
					widthClass : 'col-md-2'
				},
				{
					key : 'end',
					prettyName : 'End Date',
					widthClass : 'col-md-2'
				},
				{
					key : 'status',
					prettyName : 'Status',
					widthClass : 'col-md-2'
				}
			]
		};

		/**************************************************
		 * Fetch tasks
		 **************************************************/
		$scope.fetchingTasks = true;
		$scope.tasks = [];

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.manageTasks = function () {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		Tasks.forProject(
			project.$id(),
			function (tasks, responsestatus, responseheaders, responseconfig) {
				$scope.tasks = tasks;
				$scope.fetchingTasks = false;
				console.log("Succeeded to fetch tasks");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				$scope.fetchingTasks = false;
				console.log("Failed to fetch tasks");
				console.log(response);
			}
		);

		$scope.tasksConf = {
			resource : {
				key : 'tasks',
				prettyName : 'Tasks',
				altPrettyName : 'Tasks',
				link : $scope.manageTasks,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.tasksCrudHelpers
			},
			pagination : {
				currentPage : 1,
				itemsPerPage : 20
			},
			sortinit : {
				fieldKey : 'name',
				reverse : false
			},
			tableColumns : [
				{
					key : 'name',
					prettyName : 'Name',
					widthClass : 'col-md-2'
				},
				{
					key : 'desc',
					prettyName : 'Description',
					widthClass : 'col-md-4'
				},
				{
					key : 'priority',
					prettyName : 'Priority',
					widthClass : 'col-md-1'
				},
				{
					key : 'estimation',
					prettyName : 'Estimation',
					widthClass : 'col-md-1'
				},
				{
					key : 'status',
					prettyName : 'Status',
					widthClass : 'col-md-1'
				}
			]
		};

		/**************************************************
		 * Fetch stake holders
		 **************************************************/
		$scope.fetchingStakeHolders = true;
		$scope.stakeHolders = [];

		$scope.stakeHoldersCrudHelpers = {};
		angular.extend($scope.stakeHoldersCrudHelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		$scope.manageStakeHolders = function () {
			$location.path('/projects/'+project.$id()+'/edit');
		};

		Users.getByIds(
			project.stakeHolders,
			function (stakeHolders) {
				$scope.stakeHolders = stakeHolders;
				$scope.fetchingStakeHolders = false;
			},
			function (response) {
				console.log("Failed to fetch stake holders");
				$scope.fetchingStakeHolders = false;
			}
		);

		$scope.stakeHoldersConf = {
			resource : {
				key : 'users',
				prettyName : 'Stake Holders',
				altPrettyName : 'Stake Holders',
				link : $scope.manageStakeHolders,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.stakeHoldersCrudHelpers
			},
			pagination : {
				currentPage : 1,
				itemsPerPage : 10
			},
			sortinit : {
				fieldKey : 'lastName',
				reverse : false
			},
			tableColumns : [
				{
					key : 'lastName',
					prettyName : 'Last Name',
					widthClass : 'col-md-2'
				},
				{
					key : 'firstName',
					prettyName : 'First Name',
					widthClass : 'col-md-2'
				},
				{
					key : 'username',
					prettyName : 'Username',
					widthClass : 'col-md-1'
				}
			]
		};

		/**************************************************
		 * Fetch team members
		 **************************************************/
		$scope.fetchingTeamMembers = true;
		$scope.teamMembers = [];
		$scope.teammembersCrudHelpers = {};
		angular.extend($scope.teammembersCrudHelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		// angular.extend($scope.teammembersCrudHelpers, crudListMethods('/users'));

		$scope.viewUser = function (user) {
			$scope.teammembersCrudHelpers.view(user.$id());
		};

		$scope.manageTeamMembers = function () {
			$location.path('/projects/'+project.$id()+'/edit');
		};

		Users.getByIds(
			project.teamMembers,
			function (teamMembers) {
				$scope.teamMembers = teamMembers;
				// $scope.teamMembers = $scope.teamMembers.concat(teamMembers);
				$scope.fetchingTeamMembers = false;
				console.log("fetched team members");

			},
			function (response) {
				console.log("Failed to fetch team members");
				console.log(response);
			}
		);

		$scope.teamMembersConf = {
			rootDivClass : 'inline-block',
			collectionName : 'teamMembers',
			label : 'Team',
			// users: "teamMembers",
			// action: "viewUser(user)",
			// actionName: "Go",
			// actionIcon: "hand-right",
			actionName: "Inbox",
			actionIcon: "inbox",
			actionButtonClass: "btn-info"
			// actionHidden: "true"
			// action: {
			// 	name: "Go",
			// 	icon: "hand-right",
			// 	buttonClass: "btn-info"
			// }
			// roleFunction: "project.getUserRoles(user)",
			// fetchingUsers: "fetchingTeamMembers"
			// link : $scope.manageTeamMembers,
			// rootDivClass : 'panel-body',
			// itemsCrudHelpers : $scope.teammembersCrudHelpers
		};

		// $scope.teamMembersConf = {
		// 	resource : {
		// 		key : 'users',
		// 		prettyName : 'Team Members',
		// 		altPrettyName : 'Team Members',
		// 		link : $scope.manageTeamMembers,
		// 		rootDivClass : 'panel-body',
		// 		itemsCrudHelpers : $scope.teammembersCrudHelpers
		// 	}
		// };
	}
]);
