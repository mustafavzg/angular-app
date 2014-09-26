angular.module('projectsitemview', [
	'ngRoute',
	'resources.projects',
	'resources.productbacklog',
	'resources.sprints',
	'resources.tasks',
	'resources.users',
	'resources.comment',
	'services.crud',
	'services.i18nNotifications',
	'ui.bootstrap',
	'security.authorization',
	'filters.pagination',
	'directives.tableactive',
	'directives.icon',
	'directives.propertybar',
	'directives.test',
	'directives.users',
	'directives.comment',
	'directives.scrum',
	'directives.ganttChart',
	'underscore',
	'gantt'
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

		$routeProvider.when('/projects/:projectId', {
			redirectTo: function (routeParams, currentPath) {
				return currentPath + "/view";
			}
			// templateUrl:'projects/projects-itemview.tpl.html',
			// controller:'ProjectsItemViewCtrl',
			// resolve:{
			// 	project:[
			// 		'$route',
			// 		'Projects',
			// 		function ($route, Projects) {
			// 			return Projects.getById($route.current.params.projectId);
			// 		}
			// 	]
			// 	// authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			// }
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
	'Comments',
	'crudListMethods',
	'i18nNotifications',
	'security',
	'$q',
	'filterFilter',
	'dateFilter',
	'paginationFilter',
	'$timeout',
	'_',
	function (
		$scope,
		$location,
		project,
		ProductBacklog,
		Sprints,
		Tasks,
		Users,
		Comments,
		crudListMethods,
		i18nNotifications,
		security,
		$q,
		filter,
		dateFilter,
		paginationFilter,
		$timeout,
		_
	) {

		// /**************************************************
		//  * gantt experiment
		//  **************************************************/
		// $scope.mode = "custom";
		// $scope.maxHeight = 0;
		// $scope.showWeekends = true;
		// $scope.showNonWorkHours = true;

		// $scope.addSamples = function () {
		// 	$scope.loadData(getSampleData().data1);
		// };

		// $scope.removeSomeSamples = function () {
		// 	$scope.removeData([
		// 		{"id": "c65c2672-445d-4297-a7f2-30de241b3145"}, // Remove all Kickoff meetings
		// 		{"id": "2f85dbeb-0845-404e-934e-218bf39750c0", "tasks": [
		// 			{"id": "f55549b5-e449-4b0c-9f4b-8b33381f7d76"},
		// 			{"id": "5e997eb3-4311-46b1-a1b4-7e8663ea8b0b"},
		// 			{"id": "6fdfd775-7b22-42ec-a12c-21a64c9e7a9e"}
		// 		]}, // Remove some Milestones
		// 		{"id": "cfb29cd5-1737-4027-9778-bb3058fbed9c", "tasks": [
		// 			{"id": "57638ba3-dfff-476d-ab9a-30fda1e44b50"}
		// 		]} // Remove order basket from Sprint 2
		// 	]);
		// };

		// $scope.removeSamples = function () {
		// 	$scope.clearData();
		// };

		// $scope.rowEvent = function(event) {
		// 	// A row has been added, updated or clicked. Use this event to save back the updated row e.g. after a user re-ordered it.
		// 	console.log('Row event (by user: ' + event.userTriggered + '): ' + event.date + ' '  + event.row.description + ' (Custom data: ' + event.row.data + ')');
		// };

		// $scope.scrollEvent = function(event) {
		// 	if (angular.equals(event.direction, "left")) {
		// 		// Raised if the user scrolled to the left side of the Gantt. Use this event to load more data.
		// 		console.log('Scroll event: Left');
		// 	} else if (angular.equals(event.direction, "right")) {
		// 		// Raised if the user scrolled to the right side of the Gantt. Use this event to load more data.
		// 		console.log('Scroll event: Right');
		// 	}
		// };

		// $scope.taskEvent = function(event) {
		// 	// A task has been updated or clicked.
		// 	console.log('Task event (by user: ' + event.userTriggered + '): ' + event.task.subject + ' (Custom data: ' + event.task.data + ')');
		// };

		// function getSampleData() {

		// 	return {
		// 		"data1": [
		// 			// Order is optional. If not specified it will be assigned automatically
		// 			{"id": "2f85dbeb-0845-404e-934e-218bf39750c0", "description": "Milestones", "order": 0, "tasks": [
		// 				// Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
		// 				{"id": "f55549b5-e449-4b0c-9f4b-8b33381f7d76", "subject": "Kickoff", "color": "#93C47D", "from": "2013-10-07T09:00:00", "to": "2013-10-07T10:00:00", "data": "Can contain any custom data or object"},
		// 				{"id": "5e997eb3-4311-46b1-a1b4-7e8663ea8b0b", "subject": "Concept approval", "color": "#93C47D", "from": new Date(2013,9,18,18,0,0), "to": new Date(2013,9,18,18,0,0), "est": new Date(2013,9,16,7,0,0), "lct": new Date(2013,9,19,0,0,0)},
		// 				{"id": "b6a1c25c-85ae-4991-8502-b2b5127bc47c", "subject": "Development finished", "color": "#93C47D", "from": new Date(2013,10,15,18,0,0), "to": new Date(2013,10,15,18,0,0)},
		// 				{"id": "6fdfd775-7b22-42ec-a12c-21a64c9e7a9e", "subject": "Shop is running", "color": "#93C47D", "from": new Date(2013,10,22,12,0,0), "to": new Date(2013,10,22,12,0,0)},
		// 				{"id": "c112ee80-82fc-49ba-b8de-f8efba41b5b4", "subject": "Go-live", "color": "#93C47D", "from": new Date(2013,10,29,16,0,0), "to": new Date(2013,10,29,16,0,0)}
		// 			], "data": "Can contain any custom data or object"},
		// 			{"id": "b8d10927-cf50-48bd-a056-3554decab824", "description": "Status meetings", "order": 1, "tasks": [
		// 				{"id": "301d781f-1ef0-4c35-8398-478b641c0658", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,9,25,15,0,0), "to": new Date(2013,9,25,18,30,0)},
		// 				{"id": "0fbf344a-cb43-4b20-8003-a789ba803ad8", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,1,15,0,0), "to": new Date(2013,10,1,18,0,0)},
		// 				{"id": "12af138c-ba21-4159-99b9-06d61b1299a2", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,8,15,0,0), "to": new Date(2013,10,8,18,0,0)},
		// 				{"id": "73294eca-de4c-4f35-aa9b-ae25480967ba", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,15,15,0,0), "to": new Date(2013,10,15,18,0,0)},
		// 				{"id": "75c3dc51-09c4-44fb-ac40-2f4548d0728e", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,24,9,0,0), "to": new Date(2013,10,24,10,0,0)}
		// 			]},
		// 			{"id": "c65c2672-445d-4297-a7f2-30de241b3145", "description": "Kickoff", "order": 2, "tasks": [
		// 				{"id": "4e197e4d-02a4-490e-b920-4881c3ba8eb7", "subject": "Day 1", "color": "#9FC5F8", "from": new Date(2013,9,7,9,0,0), "to": new Date(2013,9,7,17,0,0)},
		// 				{"id": "451046c0-9b17-4eaf-aee0-4e17fcfce6ae", "subject": "Day 2", "color": "#9FC5F8", "from": new Date(2013,9,8,9,0,0), "to": new Date(2013,9,8,17,0,0)},
		// 				{"id": "fcc568c5-53b0-4046-8f19-265ebab34c0b", "subject": "Day 3", "color": "#9FC5F8", "from": new Date(2013,9,9,8,30,0), "to": new Date(2013,9,9,12,0,0)}
		// 			]},
		// 			{"id": "dd2e7a97-1622-4521-a807-f29960218785", "description": "Create concept", "order": 3, "tasks": [
		// 				{"id": "9c17a6c8-ce8c-4426-8693-a0965ff0fe69", "subject": "Create concept", "color": "#F1C232", "from": new Date(2013,9,10,8,0,0), "to": new Date(2013,9,16,18,0,0), "est": new Date(2013,9,8,8,0,0), "lct": new Date(2013,9,18,20,0,0)}
		// 			]},
		// 			{"id": "eede0c9a-6777-4b55-9359-1eada309404e", "description": "Finalize concept", "order": 4, "tasks": [
		// 				{"id": "30b8f544-5a45-4357-9a72-dd0181fba49f", "subject": "Finalize concept", "color": "#F1C232", "from": new Date(2013,9,17,8,0,0), "to": new Date(2013,9,18,18,0,0)}
		// 			]},
		// 			{"id": "b5318fd9-5d70-4eb1-9c05-65647b9aefe6", "description": "Sprint 1", "order": 5, "tasks": [
		// 				{"id": "d1fdf100-534c-4198-afb9-7bcaef0696f0", "subject": "Product list view", "color": "#F1C232", "from": new Date(2013,9,21,8,0,0), "to": new Date(2013,9,25,15,0,0)}
		// 			]},
		// 			{"id": "cfb29cd5-1737-4027-9778-bb3058fbed9c", "description": "Sprint 2", "order": 6, "tasks": [
		// 				{"id": "57638ba3-dfff-476d-ab9a-30fda1e44b50", "subject": "Order basket", "color": "#F1C232", "from": new Date(2013,9,28,8,0,0), "to": new Date(2013,10,1,15,0,0)}
		// 			]},
		// 			{"id": "df9bb83f-e9de-4cbe-944e-36aec6db53cc", "description": "Sprint 3", "order": 7, "tasks": [
		// 				{"id": "192adc6e-ab17-4cd1-82d8-4a5e7525b169", "subject": "Checkout", "color": "#F1C232", "from": new Date(2013,10,4,8,0,0), "to": new Date(2013,10,8,15,0,0)}
		// 			]},
		// 			{"id": "48cbc052-1fd5-4262-a05f-97dad7337876", "description": "Sprint 4", "order": 8, "tasks": [
		// 				{"id": "431dc7be-b61b-49a0-b26d-7ab5dfcadd41", "subject": "Login&Singup and admin view", "color": "#F1C232", "from": new Date(2013,10,11,8,0,0), "to": new Date(2013,10,15,15,0,0)}
		// 			]},
		// 			{"id": "34473cc4-5ee5-4953-8289-98779172129e", "description": "Setup server", "order": 9, "tasks": [
		// 				{"id": "43eb6d19-6402-493c-a281-20e59a6fab6e", "subject": "HW", "color": "#F1C232", "from": new Date(2013,10,18,8,0,0), "to": new Date(2013,10,18,12,0,0)}
		// 			]},
		// 			{"id": "73cae585-5b2c-46b6-aeaf-8cf728c894f7", "description": "Config server", "order": 10, "tasks": [
		// 				{"id": "8dbfda29-e775-4fa3-87c1-103b085d52ee", "subject": "SW / DNS/ Backups", "color": "#F1C232", "from": new Date(2013,10,18,12,0,0), "to": new Date(2013,10,21,18,0,0)}
		// 			]},
		// 			{"id": "41cae585-ad2c-46b6-aeaf-8cf728c894f7", "description": "Deployment", "order": 11, "tasks": [
		// 				{"id": "2dbfda09-e775-4fa3-87c1-103b085d52ee", "subject": "Depl. & Final testing", "color": "#F1C232", "from": new Date(2013,10,21,8,0,0), "to": new Date(2013,10,22,12,0,0)}
		// 			]},
		// 			{"id": "33e1af55-52c6-4ccd-b261-1f4484ed5773", "description": "Workshop", "order": 12, "tasks": [
		// 				{"id": "656b9240-00da-42ff-bfbd-dfe7ba393528", "subject": "On-side education", "color": "#F1C232", "from": new Date(2013,10,24,9,0,0), "to": new Date(2013,10,25,15,0,0)}
		// 			]},
		// 			{"id": "bffa16c6-c134-4443-8e6e-b09410c37c9f", "description": "Content", "order": 13, "tasks": [
		// 				{"id": "2f4ec0f1-cd7a-441a-8288-e788ec112af9", "subject": "Supervise content creation", "color": "#F1C232", "from": new Date(2013,10,26,9,0,0), "to": new Date(2013,10,29,16,0,0)}
		// 			]},
		// 			{"id": "ec0c5e31-449f-42d0-9e81-45c66322b640", "description": "Documentation", "order": 14, "tasks": [
		// 				{"id": "edf2cece-2d17-436f-bead-691edbc7386b", "subject": "Technical/User documentation", "color": "#F1C232", "from": new Date(2013,10,26,8,0,0), "to": new Date(2013,10,28,18,0,0)}
		// 			]}
		// 		]};
		// }

		// /**************************************************
		//  * gantt experiment end
		//  **************************************************/

		$scope.project = project;
		console.log("\nprojects are:");
		console.log(project);
		console.log("=========");
		$scope.Sprints = Sprints;
		$scope.ProductBacklog = ProductBacklog;
		$scope.Tasks = Tasks;
		$scope.Users = Users;
		$scope.projectsCrudHelpers = {};
		console.log("before rsc assg");
		
		
		console.log("aftr rsc assg..."+$scope.resourceId);

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
				glyphiconclass : 'glyphicon glyphicon-star',
				icon : 'star',
				ordering : 1
			},
			weight : {
				name : 'Weight',
				value : project.weight,
				glyphiconclass : 'glyphicon glyphicon-tint',
				icon : 'tint',
				ordering : 2
			},
			startdate : {
				name : 'Start Date',
				value : dateFilter(project.startdate, 'shortDate'),
				glyphiconclass : 'glyphicon glyphicon-chevron-right',
				icon : 'chevron-right',
				ordering : 3
			},
			enddate : {
				name : 'End Date',
				value : dateFilter(project.enddate, 'shortDate'),
				glyphiconclass : 'glyphicon glyphicon-chevron-left',
				icon : 'chevron-left',
				ordering : 4
			},
			projectprofile : {
				name : 'Project Profile',
				value : $scope.project.projectProfile.ID,
				glyphiconclass : 'glyphicon glyphicon-wrench',
				icon : 'wrench',
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
		 * Fetch backlog items
		 **************************************************/
		$scope.fetchingBacklogItems = true;
		$scope.backlogItems = [];
		$scope.backlogItemsCrudHelpers = {};
		angular.extend($scope.backlogItemsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));

		$scope.manageBacklog = function () {
			$location.path('/projects/'+project.$id()+'/productbacklog');
		};
		//$scope.resourceId = project.$id();

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
					key : 'description',
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
				// pre process status
				angular.forEach($scope.sprints, function(sprint) {
					sprint.status = sprint.getStatusPretty();
				});
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
					key : 'startdate',
					type: 'date',
					prettyName : 'Start Date',
					widthClass : 'col-md-2'
				},
				{
					key : 'enddate',
					type: 'date',
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

		$scope.sprintsGanttConf = {
			resource : {
				key : 'sprints',
				prettyName : 'Sprints',
				altPrettyName : 'Sprints',
				link : $scope.manageSprints,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.sprintsCrudHelpers,
				color: "#F1C232"
			},
			// pagination : {
			// 	currentPage : 1,
			// 	itemsPerPage : 10
			// },
			// sortinit : {
			// 	fieldKey : 'name',
			// 	reverse : false
			// },
			// ganttFieldMap : [
			// 	{
			// 		key : 'name',
			// 		taskField: 'subject',
			// 		rowField: 'description',
			// 		prettyName : 'Name',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'startdate',
			// 		type: 'date',
			// 		taskField : 'from',
			// 		prettyName : 'Start Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'enddate',
			// 		type: 'date',
			// 		taskField : 'to',
			// 		prettyName : 'End Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'status',
			// 		prettyName : 'Status',
			// 		widthClass : 'col-md-2'
			// 	}
			// ],
			ganttFieldMap : {
				row: [
					{
						key : 'name',
						ganttKey: 'description'
					}
				],
				task: [
					{
						key : 'name',
						ganttKey: 'subject'
					},
					{
						key : 'startdate',
						type: 'date',
						ganttKey : 'from'
					},
					{
						key : 'enddate',
						type: 'date',
						ganttKey : 'to'
					}
				],
				colorMap: function (sprint) {
					if( sprint.isExpired() ){
						// return "#FFCFC3";
						// return "#E8A729";
						// return "#F0F0F0";
						// return "#7F7F7F";
						// return "#ABABAB";
						return "#D1C4B1";
					}
					if( sprint.isActive() ){
						// return "#FFFE28";
						return "#FED559";
						// return "#93C47D";
					}
					if( sprint.isPlanned() ){
						// return "#10F0FF";
						// return "#62C0DC";
						return "#9FC5F8";
					}
					return "#FFFFFF";
				}
			}
		};

		$scope.sprintsGanttUpdateValidator = function (item, update) {
			var sprint = item;
			if( sprint.isExpired() ){
				return {
					onError: function () {
						i18nNotifications.pushForCurrentRoute('crud.sprints.expired.error', 'error', {});
					}
				};
			}
			return 1;
		};
		


		/**************************************************
		 * Fetch tasks
		 **************************************************/
		$scope.fetchingTasks = true;
		$scope.tasks = [];
		console.log("==========================Tasks====================");
		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.manageTasks = function () {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		Tasks.forProject(
			project.$id(),
			function (tasks, responsestatus, responseheaders, responseconfig) {
				$scope.tasks = tasks;
				console.log("Tasks=");
				console.log(tasks);
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
					widthClass : 'col-md-4'
				},
				// {
				// 	key : 'description',
				// 	prettyName : 'Description',
				// 	widthClass : 'col-md-4'
				// },
				{
					key : 'estimatedStartDate',
					type: 'date',
					prettyName : 'Start Date (Estimated)',
					widthClass : 'col-md-2'
				},
				{
					key : 'estimatedEndDate',
					type: 'date',
					prettyName : 'End Date (Estimated)',
					widthClass : 'col-md-2'
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

		$scope.tasksGanttConf = {
			resource : {
				key : 'tasks',
				prettyName : 'Tasks',
				altPrettyName : 'Tasks',
				link : $scope.manageTasks,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.tasksCrudHelpers,
				color: "#F1C232"
			},
			// pagination : {
			// 	currentPage : 1,
			// 	itemsPerPage : 10
			// },
			// sortinit : {
			// 	fieldKey : 'name',
			// 	reverse : false
			// },
			// ganttFieldMap : [
			// 	{
			// 		key : 'name',
			// 		taskField: 'subject',
			// 		rowField: 'description',
			// 		prettyName : 'Name',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'startdate',
			// 		type: 'date',
			// 		taskField : 'from',
			// 		prettyName : 'Start Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'enddate',
			// 		type: 'date',
			// 		taskField : 'to',
			// 		prettyName : 'End Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'status',
			// 		prettyName : 'Status',
			// 		widthClass : 'col-md-2'
			// 	}
			// ],
			ganttFieldMap : {
				row: [
					{
						key : 'name',
						ganttKey: 'description'
					}
				],
				task: [
					{
						key : 'name',
						ganttKey: 'subject'
					},
					{
						key : 'estimatedStartDate',
						type: 'date',
						ganttKey : 'from'
					},
					{
						key : 'estimatedEndDate',
						type: 'date',
						ganttKey : 'to'
					}
				],
				colorMap: function (task) {
					return task.getStatusDef().color;
				}
			}
		};

		$scope.tasksGanttConf2 = {
			resource : {
				key : 'tasks',
				prettyName : 'Tasks',
				altPrettyName : 'Tasks',
				link : $scope.manageTasks,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.tasksCrudHelpers,
				color: "#F1C232"
			},
			// pagination : {
			// 	currentPage : 1,
			// 	itemsPerPage : 10
			// },
			// sortinit : {
			// 	fieldKey : 'name',
			// 	reverse : false
			// },
			// ganttFieldMap : [
			// 	{
			// 		key : 'name',
			// 		taskField: 'subject',
			// 		rowField: 'description',
			// 		prettyName : 'Name',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'startdate',
			// 		type: 'date',
			// 		taskField : 'from',
			// 		prettyName : 'Start Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'enddate',
			// 		type: 'date',
			// 		taskField : 'to',
			// 		prettyName : 'End Date',
			// 		widthClass : 'col-md-2'
			// 	},
			// 	{
			// 		key : 'status',
			// 		prettyName : 'Status',
			// 		widthClass : 'col-md-2'
			// 	}
			// ],
			ganttFieldMap : {
				row: [
					{
						key : 'name',
						ganttKey: 'description'
					}
				],
				task: [
					{
						key : 'userStatus',
						ganttKey: 'subject'
					},
					{
						key : 'start',
						type: 'date',
						ganttKey : 'from'
					},
					{
						key : 'stop',
						type: 'date',
						ganttKey : 'to'
					}
				],
				colorMap: function (taskBurst) {
					return taskBurst.color;
					// if( task.isExpired() ){
					// 	// return "#FFCFC3";
					// 	// return "#E8A729";
					// 	// return "#F0F0F0";
					// 	// return "#7F7F7F";
					// 	// return "#ABABAB";
					// 	return "#D1C4B1";
					// }
					// if( task.isActive() ){
					// 	// return "#FFFE28";
					// 	return "#FED559";
					// 	// return "#93C47D";
					// }
					// if( task.isPlanned() ){
					// 	// return "#10F0FF";
					// 	// return "#62C0DC";
					// 	return "#9FC5F8";
					// }
					// return "#FFFFFF";
				}
			}
		};

		$scope.taskData = function (task) {
			var data = [];
			angular.forEach(task.bursts, function(burst) {
				data.push({
					userStatus: burst.data.status + ", " + burst.data.userId,
					start: burst.start,
					stop: burst.stop || Date.now(),
					// stop: burst.stop,
					color: task.getStatusDef(burst.data.status).color
				});
			});
			return data;
		};

		$scope.tasksGanttUpdateValidator = function (item, update) {
			var task = item;
			// if( task.isExpired() ){
			// 	return {
			// 		onError: function () {
			// 			i18nNotifications.pushForCurrentRoute('crud.tasks.expired.error', 'error', {});
			// 		}
			// 	};
			// }
			return 1;
		};

		$scope.taskToGanttData = function (task) {

		};

		/*Comments.forProject(
			 project.$id(), 
			function (comments) {
				$scope.comments = comments;
				//$scope.fetchingcomments = false;
				//allComments = $scope.comments;
				//$scope.comments = allComments;
			},
			function (response) {
				$scope.fetchingcomments = false;
			}
		);*/


		/**************************************************
		 * Crud helpers for users
		 **************************************************/

		$scope.usersCrudHelpers = {};
		angular.extend($scope.usersCrudHelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		$scope.viewUser = function (user) {
			$scope.usersCrudHelpers.view(user.$id());
		};

		$scope.manageUsers = function () {
			$location.path('/projects/'+project.$id()+'/edit');
		};

		$scope.getUserRoles = function (user) {
			// console.log("getting user roles");
			return project.getUserRoles(user);
		};

		$scope.usersConf = {
			rootDivClass: 'inline-block',
			roleFunction: "getUserRoles(user)",
			action: "viewUser(user)",
			labelIcon: "edit",
			labelClickAction: "manageUsers()",
			actionName: "Inbox",
			actionIcon: "inbox",
			actionButtonClass: "btn-info",
			helptip: "Edit"
		};

		// $timeout(function () {
		// 	$scope.usersConf = {
		// 		rootDivClass: 'panel panel-default',
		// 		// roleFunction: "",
		// 		// action: "",
		// 		// labelClickAction: "",
		// 		actionName: "foo",
		// 		actionIcon: "moo",
		// 		actionButtonClass: "btn-warning",
		// 		helptip: "foodit"
		// 	};
		// 	console.log("triggered it");
		// }, 10000);

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
				// $scope.project.attributesToDisplay.productowner = {
				// 	name : 'Product Owner',
				// 	value : productOwnerName,
				// 	glyphiconclass : 'glyphicon glyphicon-user',
				// 	ordering : 7
				// };
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
				// $scope.project.attributesToDisplay.scrummaster = {
				// 	name : 'Scrum Master',
				// 	value : scrumMasterName,
				// 	glyphiconclass : 'glyphicon glyphicon-user',
				// 	ordering : 8
				// };
				console.log("Succeded to fetch scrum master");
			},
			function (response, responsestatus, responseheaders, responseconfig) {
				$scope.fetchingScrumMaster = false;
				console.log("Failed to fetch scrum master");
				console.log(response);
			}
		);

		/**************************************************
		 * Fetch stake holders
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
				$scope.fetchingStakeHolders = false;
			}
		);

		/**************************************************
		 * Fetch team members
		 **************************************************/
		$scope.fetchingTeamMembers = true;
		$scope.teamMembers = [];

		Users.getByIds(
			project.teamMembers,
			function (teamMembers) {
				$scope.teamMembers = teamMembers;
				$scope.fetchingTeamMembers = false;
				console.log("fetched team members");
			},
			function (response) {
				console.log("Failed to fetch team members");
				console.log(response);
			}
		);
	}
]);
