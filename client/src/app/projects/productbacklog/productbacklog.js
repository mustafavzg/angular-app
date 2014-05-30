angular.module('productbacklog', [
	'ngRoute',
	'resources.productbacklog',
	'resources.tasks',
	'directives.tableactive',
	'directives.icon',
	'directives.propertybar',
	'directives.actionicon',
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
			]
			// tasks:[
			// 	'Tasks',
			// 	'$route',
			// 	function (Tasks, $route) {
			// 		return Tasks.forProductBacklogItemId($route.current.params.itemId);
			// 	}
			// ]

		})

		// How to handle the "edit a product backlog item" route
		.whenEdit({
			project:[
				'$route',
				'Projects',
				function ($route, Projects) {
					return Projects.getById($route.current.params.projectId);
				}
			],
			// projectId: projectId,
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
	// 'projectId',
	'project',
	'backlogItem',
	'crudListMethods',
	'i18nNotifications',
	function(
		$scope,
		$location,
		// projectId,
		project,
		backlogItem,
		crudListMethods,
		i18nNotifications
	){

		$scope.backlogItem = backlogItem;

		$scope.backlogItemsCrudHelpers = {};
		angular.extend($scope.backlogItemsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));

		$scope.onSave = function () {
			i18nNotifications.pushForNextRoute('crud.backlog.save.success', 'success', {id : backlogItem.$id()});
			$location.path('/projects/' + project.$id() + '/productbacklog/' + backlogItem.$id());
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
	'Tasks',
	'$q',
	function(
		$scope,
		$location,
		crudListMethods,
		project,
		backlogItem,
		Tasks,
		$q
	){

		$scope.backlogItem = backlogItem;
		$scope.project = project;

		$scope.backlogItemsCrudHelpers = {};
		angular.extend($scope.backlogItemsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));

		$scope.backlogItem.attributesToDisplay = {
			priority : {
				name : 'Priority',
				value : backlogItem.priority,
				glyphiconclass : 'glyphicon glyphicon-star',
				icon : 'star',
				ordering : 1
			},
			estimation : {
				name : 'Estimation',
				value : backlogItem.estimation,
				glyphiconclass : 'glyphicon glyphicon-time',
				icon : 'time',
				ordering : 2
			}
		};

		$scope.backlogItem.attributeValuesToDisplay = _.values($scope.backlogItem.attributesToDisplay);

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

		Tasks.forProductBacklogItemId(
			backlogItem.$id(),
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
]);
