angular.module('sprints', [
	'ngRoute',
	'resources.sprints',
	'resources.tasks',
	'directives.datecombofromto',
	'directives.propertybar',
	'directives.icon',
	'ui.bootstrap',
	'services.crud',
	'tasks',
	'underscore',
	'moment'
])

.config([
	'crudRouteProvider',
	function(crudRouteProvider){

		var projectId = [
			'$route',
			function($route) {
				return $route.current.params.projectId;
			}
		];

		var project = [
			'$route',
			'Projects',
			function ($route, Projects) {
				return Projects.getById($route.current.params.projectId);
			}
		];

		var productBacklog = [
			'$route',
			'ProductBacklog',
			function ($route, ProductBacklog) {
				return ProductBacklog.forProject($route.current.params.projectId);
			}
		];

		crudRouteProvider.routesFor('Sprints', 'projects', 'projects/:projectId')
		.whenList({
			projectId: projectId,
			sprints: [
				'$route',
				'Sprints',
				function($route, Sprints) {
					return Sprints.forProject($route.current.params.projectId);
				}
			]
		})

		.whenNew({
			project: project,
			projectId: projectId,
			sprint: [
				'$route',
				'Sprints',
				function($route, Sprints) {
					return new Sprints({projectId:$route.current.params.projectId});
				}
			],
			productBacklog : productBacklog
		})

		.whenView({
			project: project,
			projectId: projectId,
			sprint: [
				'$route',
				'Sprints',
				function(
					$route,
					Sprints
				){
					return Sprints.getById($route.current.params.itemId);
				}
			]
		})

		.whenEdit({
			project: project,
			projectId: projectId,
			sprint: [
				'$route',
				'Sprints',
				function($route, Sprints){
					return Sprints.getById($route.current.params.itemId);
				}
			],
			productBacklog : productBacklog
		});

	}
])

.controller('SprintsListCtrl', [
	'$scope',
	'$location',
	'crudListMethods',
	'projectId',
	'sprints',
	function($scope, $location, crudListMethods, projectId, sprints){
		$scope.sprints = sprints;

		angular.extend($scope, crudListMethods('/projects/'+projectId+'/sprints'));

		$scope.tasks = function (sprint, $event) {
			$location.path('/projects/'+projectId+'/sprints/'+sprint.$id()+'/tasks');
		};
	}])

.controller('SprintsItemViewCtrl', [
	'$scope',
	'$location',
	'crudListMethods',
	'project',
	'sprint',
	'Tasks',
	'$q',
	'dateFilter',
	'_',
	function(
		$scope,
		$location,
		crudListMethods,
		project,
		sprint,
		Tasks,
		$q,
		dateFilter,
		_
	){

		$scope.sprint = sprint;
		$scope.project = project;

		$scope.sprintsCrudHelpers = {};
		angular.extend($scope.sprintsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));

		$scope.sprint.attributesToDisplay = {
			status : {
				name : 'Status',
				// value : sprint.status,
				value : 'Active',
				glyphiconclass : 'glyphicon glyphicon-sound-stereo',
				icon : 'sound-stereo',
				ordering : 1
			},
			capacity : {
				name : 'Capacity',
				value : sprint.capacity,
				glyphiconclass : 'glyphicon glyphicon-user',
				icon : 'user',
				ordering : 2
			},
			startdate : {
				name : 'Start Date',
				value : dateFilter(sprint.startdate, 'shortDate'),
				glyphiconclass : 'glyphicon glyphicon-chevron-right',
				icon : 'chevron-right',
				ordering : 3
			},
			enddate : {
				name : 'End Date',
				value : dateFilter(sprint.enddate, 'shortDate'),
				glyphiconclass : 'glyphicon glyphicon-chevron-left',
				icon : 'chevron-left',
				ordering : 4
			}
		};

		$scope.sprint.attributeValuesToDisplay = _.values($scope.sprint.attributesToDisplay);

		/**************************************************
		 * Fetch task and crud helpers
		 **************************************************/
		$scope.fetchingTasks = true;
		$scope.tasks = [];

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.manageTasks = function () {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		Tasks.forSprint(
			sprint.$id(),
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

	}
])

.controller('SprintsEditCtrl', [
	'$scope',
	'$location',
	'project',
	'sprint',
	'productBacklog',
	'crudListMethods',
	'_',
	'moment',
	function($scope, $location, project, sprint, productBacklog, crudListMethods, _, moment){

		// $scope.project = project;
		$scope.productBacklog = productBacklog;
		$scope.sprint = sprint;

		angular.forEach($scope.productBacklog, function (productBacklogItem) {
			productBacklogItem.propertiesToDisplay = [
				{
					name : 'Estimation',
					value : productBacklogItem.estimation,
					glyphiconclass : 'glyphicon glyphicon-time',
					icon : 'time',
					ordering : 1
				}
			];
		});

		// $scope.sprint.attributeValuesToDisplay = _.values($scope.sprint.attributesToDisplay);

		$scope.sprintsCrudHelpers = {};
		angular.extend($scope.sprintsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));

		$scope.onSave = function () {
			$location.path('/projects/'+project.$id()+'/sprints/'+$scope.sprint.$id());
		};
		$scope.onError = function () {
			$scope.updateError = true;
		};

		$scope.sprint.sprintBacklog = $scope.sprint.sprintBacklog || [];

		$scope.productBacklogLookup = {};
		angular.forEach($scope.productBacklog, function (productBacklogItem) {
			$scope.productBacklogLookup[productBacklogItem.$id()] = productBacklogItem;
		});

		$scope.viewProductBacklogItem = function (productBacklogItemId) {
			$location.path('/projects/'+project.$id()+'/productbacklog/'+productBacklogItemId);
		};

		$scope.canAddBacklogItem = function (backlogItem) {
			return (backlogItem.estimation > $scope.remainingEstimate)? false : true;
		};

		$scope.addBacklogItem = function (backlogItem) {
			$scope.sprint.sprintBacklog.push(backlogItem.$id());
			$scope.calculateEstimates();
		};

		$scope.removeBacklogItem = function (backlogItemId) {
			$scope.sprint.sprintBacklog.splice($scope.sprint.sprintBacklog.indexOf(backlogItemId),1);
			$scope.calculateEstimates();
		};

		$scope.estimationInTotal = function () {
			var totalEstimation = 0;
			angular.forEach(sprint.sprintBacklog, function (backlogItemId) {
				totalEstimation += $scope.productBacklogLookup[backlogItemId].estimation;
			});
			return totalEstimation;
		};

		$scope.remainingEstimation = function (totalEstimation) {
			var startMoment = moment($scope.sprint.startdate);
			var endMoment = moment($scope.sprint.enddate);
			// var days = endMoment.diff(startMoment, 'days');
			var days = endMoment.businessDiff(startMoment);
			var workHoursPerDay = 8;
			var estimationLimit = $scope.sprint.capacity * days * workHoursPerDay;
			var remainingEstimation = estimationLimit - totalEstimation;
			return remainingEstimation;
		};

		$scope.notSelected = function (productBacklogItem) {
			return $scope.sprint.sprintBacklog.indexOf(productBacklogItem.$id())===-1;
		};

		$scope.calculateEstimates = function () {
			$scope.totalEstimate = $scope.estimationInTotal();
			$scope.remainingEstimate = $scope.remainingEstimation($scope.totalEstimate);
		}

		$scope.calculateEstimates();

		$scope.$watch('sprint.capacity', function (newVal, oldVal) {
			if( newVal !== oldVal ){
				$scope.calculateEstimates();
			}
		});

		$scope.$watchGroup(['sprint.startdate', 'sprint.enddate'], function (newGroup, oldGroup, scope) {
			if( !angular.equals(newGroup, oldGroup) ){
				$scope.calculateEstimates();
			}
		});

	}
]);