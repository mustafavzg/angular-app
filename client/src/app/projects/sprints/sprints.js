angular.module('sprints', [
	'ngRoute',
	'resources.sprints',
	'resources.tasks',
	'services.crud',
	'tasks'
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
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
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
	function(
		$scope,
		$location,
		crudListMethods,
		project,
		sprint,
		Tasks,
		$q
	){

		$scope.sprint = sprint;
		$scope.project = project;

		$scope.sprintscrudhelpers = {};
		angular.extend($scope.sprintscrudhelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));

		$scope.sprint.attributesToDisplay = [
			{
				name : 'Project Name',
				value : project.name
			},
			{
				name : 'Start Date',
				value : sprint.start
			},
			{
				name : 'End Date',
				value : sprint.end
			},
			{
				name : 'Status',
				value : 'ACTIVEDUMMY'
			}
		];

		/**************************************************
		 * Fetch task and crud helpers
		 **************************************************/
		$scope.fetchingtasks = true;
		$scope.tasks = [];
		$q.when(Tasks.forSprint(sprint.$id())).then(
			function (tasks) {
				$scope.tasks = tasks;
				$scope.fetchingtasks = false;
			}
		);
		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.manageTasks = function (project) {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		// $scope.manageTasksForSprint = function (sprint) {
		// 	$location.path('/projects/'+project.$id()+'/sprints/'+sprint.$id());
		// };
	}
])

.controller('SprintsEditCtrl', [
	'$scope',
	'$location',
	'projectId',
	'sprint',
	'productBacklog',
	'crudListMethods',
	function($scope, $location, projectId, sprint, productBacklog, crudListMethods){

		$scope.productBacklog = productBacklog;
		$scope.sprint = sprint;

		$scope.sprintscrudhelpers = {};
		angular.extend($scope.sprintscrudhelpers, crudListMethods('/projects/'+projectId+'/sprints'));

		$scope.onSave = function () {
			$location.path('/projects/'+projectId+'/sprints');
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
			$location.path('/projects/'+projectId+'/productbacklog/'+productBacklogItemId);
		};

		$scope.addBacklogItem = function (backlogItem) {
			$scope.sprint.sprintBacklog.push(backlogItem.$id());
		};

		$scope.removeBacklogItem = function (backlogItemId) {
			$scope.sprint.sprintBacklog.splice($scope.sprint.sprintBacklog.indexOf(backlogItemId),1);
		};

		$scope.estimationInTotal = function () {
			var totalEstimation = 0;
			angular.forEach(sprint.sprintBacklog, function (backlogItemId) {
				totalEstimation += $scope.productBacklogLookup[backlogItemId].estimation;
			});
			return totalEstimation;
		};

		$scope.notSelected = function (productBacklogItem) {
			return $scope.sprint.sprintBacklog.indexOf(productBacklogItem.$id())===-1;
		};
	}
]);