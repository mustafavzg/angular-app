angular.module('productbacklog', [
	'ngRoute',
	'resources.productbacklog',
	'resources.tasks',
	'directives.tableactive',
	'directives.icon',
	'directives.propertybar',
	'directives.actionicon',
	'directives.pieChart',
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
				getPieChartsNew($scope.tasks, $scope.pieChartConfigSample);
				$scope.groupedTasks = groupByFilter($scope.tasks, "status");
				console.log("grouped tasks");
				console.log($scope.groupedTasks);
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
				},
				{
					key : 'status',
					prettyName : 'Status',
					widthClass : 'col-md-1'
				}
			]
		};

		var augmentPieDataSummary = function (taskStatusGroups) {
			angular.forEach(taskStatusGroups, function(taskStatusGroup) {
				var status = taskStatusGroup.key;
				var tasks = taskStatusGroup.values;
				var statusColor = tasks[0].getStatusDef().color;
				var taskCount = tasks.length;
				var totalEstimation = 0, totalRemaining = 0;
				angular.forEach(tasks, function(task) {
					totalEstimation += task.estimation;
					totalRemaining += task.remaining;
				});
				taskStatusGroup.summary = {
					status: taskStatusGroup.key,
					color: statusColor,
					tasks: tasks,
					count: taskCount,
					estimation: totalEstimation,
					remaining: totalRemaining
				};
			});

			return _.sortBy(
				taskStatusGroups,
				function (taskStatusGroup) {
					return taskStatusGroup.summary.count * -1;
				}
			);
		};

		var getSeriesColors = function (taskStatusGroups) {
			return _.map(taskStatusGroups, function (taskStatusGroup) {
				return taskStatusGroup.summary.color;
			});
		};

		var pieChartDataSource = {
			counts: function (taskStatusGroups) {
				return _.map(taskStatusGroups, function (taskStatusGroup) {
					var data = taskStatusGroup.summary;
					return [data.status, data.count];
				});
			},
			estimations: function (taskStatusGroups) {
				return _.map(taskStatusGroups, function (taskStatusGroup) {
					var data = taskStatusGroup.summary;
					return [data.status, data.estimation];
				});
			}
		};

		$scope.pieCharts = [];
		$scope.defaultOptions = {
			gridPadding: {top:0, bottom:38, left:0, right:0},
			// seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
			seriesDefaults:{
				shadow: true,
				renderer: jQuery.jqplot.PieRenderer,
				trendline:{ show:false },
				rendererOptions: { padding: 8, showDataLabels: true }
			},
			legend:{
				show:true,
				placement: 'inside',
				rendererOptions: {
					// numberRows: 2
					numberColumns: 1
				},
				// location:'s',
				marginTop: '15px'
			}
			// seriesDefaults:{
			// 	shadow: false,
			// 	renderer:$.jqplot.PieRenderer,
			// 	rendererOptions:{
			// 		sliceMargin: 4,
			// 		// rotate the starting position of the pie around to 12 o'clock.
			// 		startAngle: -90
			// 	}
			// },
			// legend:{ show: true }
			// seriesDefaults: {
			// 	// Make this a pie chart.
			// 	renderer: jQuery.jqplot.PieRenderer,
			// 	rendererOptions: {
			// 		// Put data labels on the pie slices.
			// 		// By default, labels show the percentage of the slice.
			// 		showDataLabels: true
			// 	}
			// },
			// legend: { show:true, location: 'e' }
		};

		var getPieCharts = function (tasks) {
			// var taskStatusGroups = groupByFilter(tasks, "status");
			var taskStatusGroups = groupByFlatFilter(tasks, "status");
			console.log("task groups are");
			console.log(taskStatusGroups);

			// console.log("testing the filters");
			// var taskStatusGroupsTest = groupByFilter(tasks, "status", "assignedUserId");
			// console.log("group by");
			// console.log(taskStatusGroupsTest);

			// taskStatusGroupsTest = flattenGroupByFilter(taskStatusGroupsTest, true);
			// console.log("flatten group by");
			// console.log(taskStatusGroupsTest);

			// console.log("group by flat");
			// taskStatusGroupsTest = groupByFlatFilter(tasks, "status", "assignedUserId");
			// console.log(taskStatusGroupsTest);

			var sortedTaskStatusGroups = augmentPieDataSummary(taskStatusGroups);
			console.log("sorted task status grousp");
			console.log(sortedTaskStatusGroups);
			var pieChartColors = getSeriesColors(sortedTaskStatusGroups);
			angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
				var pieChart = {};
				console.log("data key");
				console.log(dataKey);
				pieChart.data = [pieChartDataSource[dataKey](sortedTaskStatusGroups)];
				pieChart.options = _.clone($scope.defaultOptions);
				pieChart.options.seriesColors = pieChartColors;
				$scope.pieCharts.push(pieChart);
			});
			console.log("pie charts");
			console.log($scope.pieCharts);
		};

		var pieChartConfig = function (config) {
			angular.extend(this, config);
		};

		pieChartConfig.getAttributes = function (attrSpecs, attrKey) {
			return _.map(
				attrSpecs,
				function (attrSpec) {
					return attrSpec[attrKey];
				}
			);
		};

		pieChartConfig.getAttributeKeys = function (attrSpecs) {
			return pieChartConfig.getAttributes(attrSpecs, 'key');
		};

		pieChartConfig.getAttributeDisplayNames = function (attrSpecs) {
			return pieChartConfig.getAttributes(attrSpecs, 'prettyName');
		};

		pieChartConfig.prototype.getGroupByAttributes = function () {
			return pieChartConfig.getAttributeKeys(this.groupBy);
		};

		pieChartConfig.prototype.getSummaryAttributes = function () {
			return pieChartConfig.getAttributeKeys(this.summary);
		};

		pieChartConfig.prototype.getCount = function () {
			return this.count;
		};

		var summarizePieData = function (items, config) {
			var groupByAttrs = config.getGroupByAttributes();
			console.log("group by attrs");
			console.log(groupByAttrs);

			var itemGroups = groupByFlatFilter(items, groupByAttrs);
			console.log("item groups before summarize");
			console.log(itemGroups);

			var summaryAttrs = config.getSummaryAttributes();
			angular.forEach(itemGroups, function(itemGroup) {
				itemGroup.summary = {};

				angular.forEach(groupByAttrs, function(attrKey) {
					// itemGroup.summary[attrKey] = itemGroup.key;
					_.extend(itemGroup.summary, itemGroup.getTargetValues());
				});

				// var status = itemGroup.key;
				var items = itemGroup.values;

				// color
				// var statusColor = items[0].getStatusDef().color;
				_.extend(itemGroup.summary, {color: items[0].getStatusDef().color});

				// count
				if( config.getCount() ){
					// var itemCount = items.length;
					_.extend(itemGroup.summary, {count: items.length});
				}

				// summary items
				// var totalEstimation = 0, totalRemaining = 0;
				angular.forEach(summaryAttrs, function(summaryAttr) {
					itemGroup.summary[summaryAttr] = 0;
				});
				angular.forEach(items, function(item) {
					// totalEstimation += item.estimation;
					// totalRemaining += item.remaining;
					angular.forEach(summaryAttrs, function(summaryAttr) {
						itemGroup.summary[summaryAttr] += item[summaryAttr];
					});
				});

				// itemGroup.summary = {
				// 	status: itemGroup.key,
				// 	color: statusColor,
				// 	items: items,
				// 	count: itemCount,
				// 	estimation: totalEstimation,
				// 	remaining: totalRemaining
				// }
			});

			console.log("itemgroups after summarize");
			console.log(itemGroups);

			// !!!
			return _.sortBy(
				itemGroups,
				function (itemGroup) {
					return itemGroup.summary.count * -1;
				}
			);
		};

		$scope.pieChartConfigSample = {
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
			// collapse: 0
			collapse: 1,
			cumulative: 0
		};

		var getPieChartsNew = function (items, config) {
			// var groupByColumns = config.getGroupByColumns();
			// var itemGroups = groupByFilter(items, groupByColumns);
			config = new pieChartConfig(config);
			console.log("config blessed is ");
			console.log(config);
			var sortedItemGroups = summarizePieData(items, config);
			console.log("sorted item status grousp");
			console.log(sortedItemGroups);
			var pieChartColors = getSeriesColors(sortedItemGroups);
			angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
				var pieChart = {};
				console.log("data key");
				console.log(dataKey);
				pieChart.data = [pieChartDataSource[dataKey](sortedItemGroups)];
				pieChart.options = _.clone($scope.defaultOptions);
				pieChart.options.seriesColors = pieChartColors;
				$scope.pieCharts.push(pieChart);
			});
			console.log("pie charts");
			console.log($scope.pieCharts);
		};

		$scope.tasksPieData = [[
			['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14],
			['Out of home', 16],['Commuting', 7], ['Orientation', 9]
		]];

		$scope.tasksPieOptions = {
			gridPadding: {top:0, bottom:38, left:0, right:0},
			seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
			seriesDefaults:{
				shadow: true,
				renderer: jQuery.jqplot.PieRenderer,
				trendline:{ show:false },
				rendererOptions: { padding: 8, showDataLabels: true }
			},
			legend:{
				show:true,
				placement: 'inside',
				rendererOptions: {
					// numberRows: 2
					numberColumns: 1
				},
				// location:'s',
				marginTop: '15px'
			}
			// seriesDefaults:{
			// 	shadow: false,
			// 	renderer:$.jqplot.PieRenderer,
			// 	rendererOptions:{
			// 		sliceMargin: 4,
			// 		// rotate the starting position of the pie around to 12 o'clock.
			// 		startAngle: -90
			// 	}
			// },
			// legend:{ show: true }
			// seriesDefaults: {
			// 	// Make this a pie chart.
			// 	renderer: jQuery.jqplot.PieRenderer,
			// 	rendererOptions: {
			// 		// Put data labels on the pie slices.
			// 		// By default, labels show the percentage of the slice.
			// 		showDataLabels: true
			// 	}
			// },
			// legend: { show:true, location: 'e' }
		};

	}
]);
