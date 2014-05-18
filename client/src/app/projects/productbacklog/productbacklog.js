angular.module('productbacklog', [
	'ngRoute',
	'resources.productbacklog',
	'resources.tasks',
	'services.crud',
	'services.i18nNotifications'
])

.config([
	'crudRouteProvider',
	function(
		crudRouteProvider
	){
		// projectId is a helper method wrapped with DI annotation that will be used in
		// route resolves in this file.
		var projectId = [
			'$route',
			function($route) {
				return $route.current.params.projectId;
			}
		];

		// Create the CRUD routes for editing the product backlog
		crudRouteProvider.routesFor('ProductBacklog', 'projects', 'projects/:projectId')
		// How to handle the "list product backlog items" route
		.whenList({
			projectId: projectId,
			backlog : [
				'$route',
				'ProductBacklog',
				function(
					$route,
					ProductBacklog
				){
					return ProductBacklog.forProject($route.current.params.projectId);
				}
			]
		})

		// How to handle the "create a new product backlog item" route
		.whenNew({
			projectId: projectId,
			backlogItem : [
				'$route',
				'ProductBacklog',
				function(
					$route,
					ProductBacklog
				){
					return new ProductBacklog({projectId:$route.current.params.projectId});
				}
			]
		})

		// How to handle the "view a product backlog item" route
		.whenView({
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
			backlogItem : [
				'$route',
				'ProductBacklog',
				function(
					$route,
					ProductBacklog
				){
					return ProductBacklog.getById($route.current.params.itemId);
				}
			],
			tasks:[
				'Tasks',
				'$route',
				function (Tasks, $route) {
					return Tasks.forProductBacklogItemId($route.current.params.itemId);
				}
			]

		})

		// How to handle the "edit a product backlog item" route
		.whenEdit({
			projectId: projectId,
			backlogItem : [
				'$route',
				'ProductBacklog',
				function(
					$route,
					ProductBacklog
				){
					return ProductBacklog.getById($route.current.params.itemId);
				}
			]
		});
	}
])

// The controller for editing a product backlog item
.controller('ProductBacklogEditCtrl', [
	'$scope',
	'$location',
	'projectId',
	'backlogItem',
	'crudListMethods',
	'i18nNotifications',
	function(
		$scope,
		$location,
		projectId,
		backlogItem,
		crudListMethods,
		i18nNotifications
	){

		$scope.backlogItem = backlogItem;
		$scope.backlogItemscrudhelpers = {};
		angular.extend($scope.backlogItemscrudhelpers, crudListMethods('/projects/'+projectId+'/productbacklog'));


		$scope.onSave = function () {
			i18nNotifications.pushForNextRoute('crud.backlog.save.success', 'success', {id : backlogItem.$id()});
			$location.path('/projects/'+projectId+'/productbacklog');
		};

		$scope.onError = function () {
			i18nNotifications.pushForCurrentRoute('crud.backlog.save.error', 'error');
			$scope.updateError = true;
		};
	}
])

// The controller for listing product backlog items
.controller('ProductBacklogListCtrl', [
	'$scope',
	'crudListMethods',
	'projectId',
	'backlog',
	function(
		$scope,
		crudListMethods,
		projectId,
		backlog
	){
		$scope.backlog = backlog;
		angular.extend($scope, crudListMethods('/projects/'+projectId+'/productbacklog'));
	}
])

// The controller for viewing a product backlog item
.controller('ProductBacklogItemViewCtrl', [
	'$scope',
	'$location',
	'crudListMethods',
	'project',
	'backlogItem',
	'tasks',
	'Tasks',
	'$q',
	function(
		$scope,
		$location,
		crudListMethods,
		project,
		backlogItem,
		tasks,
		Tasks,
		$q
	){

		$scope.backlogItem = backlogItem;
		$scope.tasks = tasks;
		$scope.project = project;

		$scope.backlogItemscrudhelpers = {};
		angular.extend($scope.backlogItemscrudhelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));


		$scope.backlogItem.attributesToDisplay = [
			{
				name : 'Project Name',
				value : project.name
			},
			{
				name : 'Estimation',
				value : backlogItem.estimation
			},
			{
				name : 'Priority',
				value : backlogItem.priority
			}
		];

		/**************************************************
		 * Fetch task and crud helpers
		 **************************************************/
		$scope.fetchingtasks = true;
		$scope.tasks = [];
		$q.when(Tasks.forProductBacklogItemId(backlogItem.$id())).then(
			function (tasks) {
				$scope.tasks = tasks;
				$scope.fetchingtasks = false;
			}
		);
		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		console.log(project);
		console.log($scope.taskscrudhelpers);

		$scope.manageTasks = function (project) {
			$location.path('/projects/'+project.$id()+'/tasks');
		};

		// $scope.manageTasksForBacklogItem = function (backlogItem) {
		// 	$location.path('/projects/'+project.$id()+'/productbacklog/'+backlogItem.$id());
		// };

	}
]);
