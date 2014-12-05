angular.module('productbacklog', [
	'ngRoute',
	'resources.productbacklog',
	'resources.tasks',
	'directives.tableactive',
	'directives.icon',
	'directives.propertybar',
	'directives.actionicon',
	'directives.pieChart',
	'directives.burnDownChart',
	'services.locationHistory',
	'services.crud',
	'services.i18nNotifications',
	'ui.chart',
	'filters.groupBy',
	'filters.groupByFlat',
	'filters.flattenGroupBy',
	'underscore'
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

		var project = [
			'$route',
			'Projects',
			function ($route, Projects) {
				return Projects.getById($route.current.params.projectId);
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
			project: project,
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
			project: project,
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
			project: project,
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
	'crudEditHandlers',
	'i18nNotifications',
	'locationHistory',
	function(
		$scope,
		$location,
		// projectId,
		project,
		backlogItem,
		crudListMethods,
		crudEditHandlers,
		i18nNotifications,
		locationHistory
	){

		$scope.backlogItem = backlogItem;

		$scope.backlogItemsCrudHelpers = {};
		angular.extend($scope.backlogItemsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/productbacklog'));
		angular.extend($scope, crudEditHandlers('backlog'));

		$scope.back = function () {
			locationHistory.prev()
		};

		// $scope.onSave = function (savedBacklogItem) {
		// 	// return notification spec
		// 	return {
		// 		key: 'crud.backlog.save.success',
		// 		type: 'success',
		// 		context: {id : savedBacklogItem.$id()}
		// 	};

		// 	// i18nNotifications.pushForNextRoute('crud.backlog.save.success', 'success', {id : savedBacklogItem.$id()});
		// 	console.log("item saved is");
		// 	console.log(savedBacklogItem);
		// 	// locationHistory.prev();

		// 	// Holding the changes here for the save and (back, view, next) functionality
		// 	// for now just returning back to the previous screen
		// 	// var backlogItemId = backlogItem.$id();
		// 	// if( angular.isDefined(backlogItemId) ){
		// 	// 	$location.path('/projects/' + project.$id() + '/productbacklog/' + backlogItemId);
		// 	// }
		// 	// else {
		// 	// 	locationHistory.prev();
		// 	// 	// $location.path('/projects/' + project.$id() + '/productbacklog/');
		// 	// }
		// };

		// // $scope.onSaveAndNext = function (savedBacklogItem) {
		// // 	i18nNotifications.pushForCurrentRoute('crud.backlog.save.success', 'success', {id : savedBacklogItem.$id()});
		// // 	console.log("item is saved and creating the next item");
		// // 	console.log(savedBacklogItem);
		// // };

		// $scope.onSaveError = function (error) {
		// 	return {
		// 		key: 'crud.backlog.save.error',
		// 		type: 'error',
		// 		context: {
		// 			error: error
		// 		}
		// 	};
		// 	// i18nNotifications.pushForCurrentRoute('crud.backlog.save.error', 'error');
		// 	// $scope.updateError = true;
		// };

		// $scope.onRemove = function (removedBacklogItem) {
		// 	console.log("removing backlog");
		// 	console.log(removedBacklogItem);
		// 	return {
		// 		key: 'crud.backlog.remove.success',
		// 		type: 'success',
		// 		context: {id : removedBacklogItem.$id()}
		// 	};

		// 	// var projectId = $route.current.params.projectId;
		// 	// var taskid = task.$id();
		// 	// $location.path('/projects/' + projectId + '/tasks');
		// };

		// $scope.onRemoveError = function (error) {
		// 	return {
		// 		key: 'crud.backlog.remove.error',
		// 		type: 'error',
		// 		context: {
		// 			error: error
		// 		}
		// 	};
		// };

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
	'groupByFilter',
	'groupByFlatFilter',
	'flattenGroupByFilter',
	'_',
	function(
		$scope,
		$location,
		crudListMethods,
		project,
		backlogItem,
		Tasks,
		$q,
		groupByFilter,
		groupByFlatFilter,
		flattenGroupByFilter,
		_
	){

		$scope.backlogItem = backlogItem;
		console.log("Backlog Item=");
		console.log(backlogItem);
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
				// getPieCharts($scope.tasks);
				// getPieChartsNew($scope.tasks, $scope.pieChartConfigSample);
				// $scope.groupedTasks = groupByFilter($scope.tasks, "status");
				// console.log("grouped tasks");
				// console.log($scope.groupedTasks);
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

		$scope.pieChartConfig = {
			title: 'Tasks',
			groupBy: [
				{
					prettyName: 'Status',
					key: 'status',
					ordering: 1,
					colorMap: function (item) {
						return item.getStatusDef().color;
					},
					groupByOrder: function (item) {
						// console.log("ordering is");
						// console.log(item.getStatusDef().ordering);
						return item.getStatusDef().ordering;
						// return item.getStatusDef().ordering || 0;
					}
				},
				{
					prettyName: 'Type',
					key: 'type',
					ordering: 2,
					colorMap: function (item) {
						return item.getTypeDef().color;
					},
					groupByOrder: function (item) {
						return item.getTypeDef().ordering;
						// return item.getTypeDef().ordering || 0;
					}
				}
			],
			summary: [
				{
					prettyName: 'Estimation',
					prettyNameSuffix: "for",
					key: 'estimation',
					ordering: 1
				},
				{
					prettyName: 'Remaining estimation',
					prettyNameSuffix: "for",
					key: 'remaining',
					ordering: 2
				}
			],
			count: 1,
			collapse: 1,
			cumulative: 0
		};

		// $scope.burnDownChartConfig = {
		// 	title: 'Tasks',
		// 	groupBy: [
		// 		{
		// 			prettyName: 'Status',
		// 			key: 'status',
		// 			ordering: 1,
		// 			colorMap: function (item) {
		// 				return item.getStatusDef().color;
		// 			},
		// 			groupByOrder: function (item) {
		// 				// console.log("ordering is");
		// 				// console.log(item.getStatusDef().ordering);
		// 				return item.getStatusDef().ordering;
		// 				// return item.getStatusDef().ordering || 0;

		// 			}
		// 		},
		// 		{
		// 			prettyName: 'Type',
		// 			key: 'type',
		// 			ordering: 2,
		// 			colorMap: function (item) {
		// 				return item.getTypeDef().color;
		// 			},
		// 			groupByOrder: function (item) {
		// 				return item.getTypeDef().ordering;
		// 				// return item.getTypeDef().ordering || 0;
		// 			}
		// 		}
		// 	],
		// 	summary: [
		// 		{
		// 			prettyName: 'Estimation',
		// 			prettyNameSuffix: "for",
		// 			key: 'estimation',
		// 			ordering: 1
		// 		},
		// 		{
		// 			prettyName: 'Remaining estimation',
		// 			prettyNameSuffix: "for",
		// 			key: 'remaining',
		// 			ordering: 2
		// 		}
		// 	],
		// 	count: 1,
		// 	// collapse: 0
		// 	collapse: 0,
		// 	cumulative: 0
		// };

	}
]);
