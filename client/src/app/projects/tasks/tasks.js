angular.module('tasksnew', [
	'ngRoute',
	'resources.sprints',
	'resources.productbacklog',
	'resources.users',
	'resources.tasks',
	'resources.projects',
	'services.crud'
])

.config([
	'crudRouteProvider',
	function (crudRouteProvider) {

		var productBacklog = [
			'$route',
			'ProductBacklog',
			function ($route, ProductBacklog) {
				return ProductBacklog.forProject($route.current.params.projectId);
			}
		];

		var sprintBacklogItems = [
			'Sprints',
			'ProductBacklog',
			'$route',
			function (Sprints, ProductBacklog, $route) {
				var sprintPromise = Sprints.getById($route.current.params.sprintId);
				return sprintPromise.then(
					function (sprint) {
						return ProductBacklog.getByIds(sprint.sprintBacklog);
					}
				);
			}
		];

		var teamMembers = [
			'Projects',
			'Users',
			'$route',
			function (Projects, Users, $route) {
				var projectPromise = Projects.getById($route.current.params.projectId);
				return projectPromise.then(
					function(project){
						return Users.getByIds(project.teamMembers);
					}
				);
			}];

		crudRouteProvider.routesFor('Tasks', 'projects', 'projects/:projectId')

		.whenList({
			tasks:[
				'Tasks',
				'$route',
				function (Tasks, $route) {
					return Tasks.forProject($route.current.params.projectId);
				}
			]
		})

		.whenNew({
			task:[
				'Tasks',
				'$route',
				function (Tasks, $route) {
					return new Tasks({
						projectId:$route.current.params.projectId,
						// sprintId:$route.current.params.sprintId,
						state:Tasks.statesEnum[0]
					});
				}
			],
			// sprintBacklogItems:sprintBacklogItems,
			teamMembers:teamMembers
		})

		.whenView({
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
			task:[
				'Tasks',
				'$route',
				function (Tasks, $route) {
					return Tasks.getById($route.current.params.itemId);
				}
			]
			// sprintBacklogItems:sprintBacklogItems,
			// teamMembers:teamMembers
		})

		.whenEdit({
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
			task:[
				'Tasks',
				'$route',
				function (Tasks, $route) {
					return Tasks.getById($route.current.params.itemId);
				}
			],
			// sprintBacklogItems:sprintBacklogItems,
			teamMembers:teamMembers
		});
	}
])

.controller('TasksListCtrl', [
	'$scope',
	'crudListMethods',
	'$route',
	'tasks',
	function (
		$scope,
		crudListMethods,
		$route,
		tasks
	) {
		$scope.tasks = tasks;
		var projectId = $route.current.params.projectId;
		// var sprintId = $route.current.params.sprintId;
		angular.extend($scope, crudListMethods('/projects/' + projectId + '/tasks'));
	}
])

.controller('TasksItemViewCtrl', [
	'$scope',
	'$location',
	'$route',
	'crudListMethods',
	'Tasks',
	// 'sprintBacklogItems',
	// 'teamMembers',
	'project',
	'task',
	function (
		$scope,
		$location,
		$route,
		crudListMethods,
		Tasks,
		// sprintBacklogItems,
		// teamMembers,
		project,
		task
	) {
		$scope.project = project;
		$scope.task = task;
		$scope.statesEnum = Tasks.statesEnum;
		// $scope.sprintBacklogItems = sprintBacklogItems;
		// $scope.teamMembers = teamMembers;

		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));


		$scope.task.attributesToDisplay = [
			{
				name : 'Project Name',
				value : project.name
			},
			{
				name : 'Estmation',
				value : task.estimation
			},
			{
				name : 'Remaining',
				value : task.remaining
			},
			{
				name : 'State',
				value : task.state
			}
		];

	}
])

.controller('TasksEditCtrl', [
	'$scope',
	'$location',
	'$route',
	'Tasks',
	// 'sprintBacklogItems',
	'teamMembers',
	'task',
	'project',
	'crudListMethods',
	function (
		$scope,
		$location,
		$route,
		Tasks,
		// sprintBacklogItems,
		teamMembers,
		task,
		project,
		crudListMethods
	) {
		$scope.task = task;
		console.log(task);
		$scope.statesEnum = Tasks.statesEnum;
		// $scope.sprintBacklogItems = sprintBacklogItems;
		$scope.teamMembers = teamMembers;

		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));


		$scope.onSave = function () {
			var projectId = $route.current.params.projectId;
			// var sprintId = $route.current.params.sprintId;
			$location.path('/projects/' + projectId + '/tasks');

			// $location.path('/admin/users');
		};
		$scope.onError = function() {
			$scope.updateError = true;
		};
	}
]);