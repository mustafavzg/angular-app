angular.module('tasksnew', [
	'ngRoute',
	'resources.sprints',
	'resources.productbacklog',
	'resources.users',
	'resources.comment',
	'resources.tasks',
	'resources.projects',
	'directives.userscombosearchadd',
	'directives.datecombofromto',
	'directives.tableactive',
	'directives.pieChart',
	'services.crud',
	'services.resourceDictionary',
	'services.timeBursts',
	'services.statusLog',
	'filters.stopWatch',
	'services.i18nNotifications',
	'underscore'
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
					return new Tasks({
						projectId:$route.current.params.projectId,
						// sprintId:$route.current.params.sprintId,
						state:Tasks.statusEnum[0]
					});
				}
			],
			productBacklogItems:productBacklog,
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
			productBacklogItems:productBacklog,
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

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+ projectId +'/tasks'));

		$scope.tasksConf = {
			resource : {
				key : 'tasks',
				prettyName : 'Tasks',
				altPrettyName : 'Tasks',
				// link : $scope.manageTasks,
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.tasksCrudHelpers
			},
			pagination : {
				currentPage : 1,
				itemsPerPage : 100
			},
			sortinit : {
				fieldKey : 'priority',
				reverse : false
			},
			searchinit : {
				field : {
					key : 'name',
					prettyName : 'Name',
					icon : 'font'
				}
			},
			tableViewSpec: {
 				description: {
					key : 'description',
					prettyDescription : 'Description'
				},
				columns : [
					{
						key : 'name',
						prettyName : 'Name',
						widthClass : 'col-md-4',
						icon : ""
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
						widthClass : 'col-md-2',
						skipSearch: true
					},
					{
						key : 'estimatedEndDate',
						type: 'date',
						prettyName : 'End Date (Estimated)',
						widthClass : 'col-md-2',
						skipSearch: true
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
			},
			// tableColumns : [
			// 	{
			// 		key : 'name',
			// 		prettyName : 'Name',
			// 		widthClass : 'col-md-4',
			// 		icon : ""
			// 	},
			// 	// {
			// 	// 	key : 'description',
			// 	// 	prettyName : 'Description',
			// 	// 	widthClass : 'col-md-4'
			// 	// },
			// 	{
			// 		key : 'estimatedStartDate',
			// 		type: 'date',
			// 		prettyName : 'Start Date (Estimated)',
			// 		widthClass : 'col-md-2',
			// 		skipSearch: true
			// 	},
			// 	{
			// 		key : 'estimatedEndDate',
			// 		type: 'date',
			// 		prettyName : 'End Date (Estimated)',
			// 		widthClass : 'col-md-2',
			// 		skipSearch: true
			// 	},
			// 	{
			// 		key : 'priority',
			// 		prettyName : 'Priority',
			// 		widthClass : 'col-md-1'
			// 	},
			// 	{
			// 		key : 'estimation',
			// 		prettyName : 'Estimation',
			// 		widthClass : 'col-md-1'
			// 	},
			// 	{
			// 		key : 'status',
			// 		prettyName : 'Status',
			// 		widthClass : 'col-md-1'
			// 	}
			// ],
			mediaViewSpec: {
				title: {
					key : 'name',
					prettyName : 'Name'
				},
 				description: {
					key : 'description',
					prettyDescription : 'Description'
				},
				// labels: [
				// 	{
				// 		key : 'status',
				// 		prettyName : 'Status',
				// 		bclass: 'info'
				// 	},
				// 	{
				// 		key : 'estimatedStartDate',
				// 		type: 'date',
				// 		prettyName : 'Start Date (Estimated)',
				// 		icon : 'chevron-right',
				// 		bclass: 'warning'
				// 	},
				// 	{
				// 		key : 'estimatedEndDate',
				// 		type: 'date',
				// 		prettyName : 'End Date (Estimated)',
				// 		icon : 'chevron-left',
				// 		bclass: 'warning'
				// 	}
				// ],
				// reverse: true,
				properties: [
					{
						key : 'priority',
						prettyName : 'Priority',
						icon : 'star'
					},
					{
						key : 'estimation',
						prettyName : 'Estimation',
						icon : 'time'
					},
					// {
					// 	key : 'status',
					// 	prettyName : 'Status',
					// 	icon : 'sound-stereo'
					// },
					{
						key : 'estimatedStartDate',
						type: 'date',
						prettyName : 'Start Date (Estimated)',
						icon : 'chevron-right'
					},
					{
						key : 'estimatedEndDate',
						type: 'date',
						prettyName : 'End Date (Estimated)',
						icon : 'chevron-left'
					}
				]
			},
			treeViewSpec: {
				title: {
					key : 'name',
					prettyName : 'Name'
				},
 				description: {
					key : 'description',
					prettyDescription : 'Description'
				},
				labels: [
					{
						key : 'status',
						prettyName : 'Status',
						bclass: 'info'
					},
					{
						key : 'estimatedStartDate',
						type: 'date',
						prettyName : 'Start Date (Estimated)',
						icon : 'chevron-right',
						bclass: 'warning'
					},
					{
						key : 'estimatedEndDate',
						type: 'date',
						prettyName : 'End Date (Estimated)',
						icon : 'chevron-left',
						bclass: 'warning'
					}
				],
				getNodeParentIdFn : function (node) {
					return node.parent;
				}
			}
		};
	}
])

.controller('TasksItemViewCtrl', [
	'$scope',
	'$location',
	'$route',
	'crudListMethods',
	'crudEditHandlers',
	'Tasks',
	// 'sprintBacklogItems',
	// 'teamMembers',
	'project',
	'task',
	'_',
	'$interval',
	'stopWatchFilter',
	'i18nNotifications',
	'$q',
	'timeBursts',
	function (
		$scope,
		$location,
		$route,
		crudListMethods,
		crudEditHandlers,
		Tasks,
		// sprintBacklogItems,
		// teamMembers,
		project,
		task,
		_,
		$interval,
		stopWatchFilter,
		i18nNotifications,
		$q,
		timeBursts
	) {

		$scope.project = project;
		$scope.task = task;

		$scope.tasks = [task];
		console.log("tasks=");
		console.log($scope.tasks);
		$scope.resourceId = task.$id();
		$scope.forResource = "task";
		$scope.statusEnum = Tasks.statusEnum;
		// $scope.sprintBacklogItems = sprintBacklogItems;
		// $scope.teamMembers = teamMembers;

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

		$scope.taskCrudNotificationHelpers = angular.extend({}, crudEditHandlers('tasks'));;

		$scope.task.attributesToDisplay = {
			estimation : {
				name : 'Estimation',
				value : task.estimation,
				icon : 'time',
				ordering : 1
			},
			remaining : {
				name : 'Remaining',
				value : task.remaining,
				icon : 'signal',
				flip : true,
				ordering : 2
			},
 			status : {
				name : 'Status',
				value : task.status,
				icon : 'sound-stereo',
				ordering : 3
			}
		};
		$scope.task.attributeValuesToDisplay = _.values($scope.task.attributesToDisplay);

		/**************************************************
		 * Task timer data Gantt chart
		 **************************************************/

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
				if( angular.isDefined(burst) ){
					data.push({
						userStatus: (angular.isDefined(burst.data)? burst.data.status + ", " + burst.data.userId : undefined),
						start: burst.start,
						stop: burst.stop || Date.now(),
						// stop: burst.stop,
						color: (angular.isDefined(burst.data)? task.getStatusDef(burst.data.status).color: undefined)
					});
				}
			});
			console.log("burst data:\n");
			console.log(data);
			return data;
		};

		/**************************************************
		 * Task Timer
		 **************************************************/

		$scope.clock = Date.now();
		var clock = $interval(
			function () {
				$scope.clock = Date.now();
			},
			1000
		);

		$scope.timerStarted = function () {
			// return (!!startTime)? true : false;
			return $scope.timerRunning;
		};

		var taskTimer;
		var startTime;
		var stopTime;
		$scope.timerRunning = false;

		var taskBursts = timeBursts($scope.task.bursts);
		var lastBurst = taskBursts.lastBurst();
		var prevBurstTime = taskBursts.totalBurstTime();

		console.log("Initial tasks bursts");
		console.log(taskBursts);

		$scope.timer = prevBurstTime;
		// console.log("burst time total");
		// console.log($scope.timer);

		if( taskBursts.timerRunning() ){
			$scope.timerRunning = true;
			startTime = lastBurst.start;
			taskTimer = $interval(
				function () {
					if( angular.isDefined(startTime) ){
						$scope.timer = Date.now() - startTime + prevBurstTime;
					}
				},
				1000
			);
		}

		/**************************************************
		 * Callback when the timer starts
		 * the callback should return a promise object
		 * indicating the callback success
		 **************************************************/
		$scope.beforeTimerStart = function (startTime) {
			taskBursts.push({
				start: startTime,
				data: {
					status: task.status,
					userId: task.assignedUserId
				}
			});
			return $scope.task.$updateFields(
				// {bursts: taskBursts},
				{bursts: taskBursts.getBursts()},
				function (response) {
					console.log("updated the burst: startTime : beforeTimerStart");
					console.log($scope.task);
					console.log(response);
				},
				function (error) {
					var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
					i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					taskBursts.pop();
					console.log("Failed to update the time burst: startTime : beforeTimerStart");
					return $q.reject("Error in time burst updates");
				}
			);
		};

		/**************************************************
		 * startTimer
		 *
		 * beforeTimerStart : a callback that returns a promise object
		 * - Timer should be started only if the callback succeeds
		 **************************************************/
		$scope.startTimer = function (beforeTimerStart) {
			$scope.timerRunning = true;
			startTime = Date.now();
			if( angular.isFunction(beforeTimerStart) ){
				beforeTimerStart(startTime).then(
					function (response) {
						// start the timer
						taskTimer = $interval(
							function () {
								if( angular.isDefined(startTime) ){
									$scope.timer = Date.now() - startTime + prevBurstTime;

								}
							},
							1000
						);
						console.log("started the timer: startTimer2");
					},
					function (error) {
						// reset timer state
						$scope.timerRunning = false;
						console.log("reset the timer state: startTimer2");
					}
				);
			}
		};

		/**************************************************
		 * Callback when the timer stops
		 * the callback should return a promise object
		 * indicating the callback success
		 **************************************************/
		$scope.beforeTimerStop = function (stopTime) {
			var lastBurst =  taskBursts.pop();
			// var lastBurst = taskBursts.lastBurst();
			lastBurst.stop = stopTime;
			taskBursts.push(lastBurst);

			return $scope.task.$updateFields(
				{bursts: taskBursts.getBursts()},
				function (response) {
					console.log("updated the burst: stopTime");
					console.log($scope.task);
					console.log(response);
					// $scope.timerRunning = false;
					// destroyTimer();
					// prevBurstTime = sumBursts(taskBursts);
					prevBurstTime = taskBursts.totalBurstTime();
				},
				function (error) {
					var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
					i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					var lastBurst = taskBursts.pop();
					delete lastBurst.stop;
					taskBursts.push(lastBurst);
					return $q.reject("Error in time burst updates");
				}
			);
		};

		/**************************************************
		 * stopTimer
		 *
		 * stop the timer
		 **************************************************/
		$scope.stopTimer = function (beforeTimerStop) {
			stopTime = Date.now();

			if( angular.isFunction(beforeTimerStop) ){
				beforeTimerStop(stopTime).then(
					function (response) {
						// stop the timer
						$scope.timerRunning = false;
						destroyTimer();
						console.log("stoped the timer: stopTimer2");
					},
					function (error) {
						console.log("dont stop the timer: stopTimer2");
					}
				);
			}
		};

		var destroyClock = function () {
			if( angular.isDefined(clock) ){
				$interval.cancel(clock);
				clock = undefined;
			}
		};

		var destroyTimer = function () {
			if( angular.isDefined(taskTimer) ){
				$interval.cancel(taskTimer);
				taskTimer = undefined;
			}
		};

		$scope.$on('$destroy', function () {
			destroyClock();
			destroyTimer();
		});

		/**************************************************
		 * Task comments
		 * TODO : implement a directive
		 **************************************************/
		task.comments = task.comments || [];

		$scope.commentsConf = {
			resource : {
				key : 'comments',
				prettyName : 'Comments',
				altPrettyName : 'Comments',
				// link : $scope.manageTasks,
				rootDivClass : 'panel-body'
				// itemsCrudHelpers : $scope.tasksCrudHelpers
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
				}
			]
		};

		/**************************************************
		 * Task Pie Chart
		 * Shows the time spent in a particular status
		**************************************************/
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
			// collapse: 0
			collapse: 0,
			cumulative: 0
		};

	}
])

.controller('TasksEditCtrl', [
	'$scope',
	'$location',
	'$route',
	'Tasks',
	'productBacklogItems',
	'teamMembers',
	'task',
	'project',
	'crudListMethods',
	'crudEditHandlers',
	'resourceDictionary',
	'$interval',
	'$q',
	'statusLog',
	// 'stopWatchFilter',
	'_',
	function (
		$scope,
		$location,
		$route,
		Tasks,
		productBacklogItems,
		teamMembers,
		task,
		project,
		crudListMethods,
		crudEditHandlers,
		resourceDictionary,
		$interval,
		$q,
		statusLog,
		// stopWatchFilter,
		_
	) {

		$scope.task = task;
		$scope.project = project;

		$scope.statusEnum = Tasks.statusEnum;

		// status and type
		// $scope.statusDef = Tasks.statusDef;
		// $scope.typeDef = Tasks.typeDef;
		$scope.statusDef = _.sortBy(
			Tasks.getStatusDef(),
			function (statusSpec) {
				return statusSpec.ordering;
			}
		);
		$scope.statusDef = Tasks.getStatusDef();
		$scope.typeDef = Tasks.getTypeDef();

		$scope.productBacklogItems = productBacklogItems;
		$scope.teamMembers = teamMembers;

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		angular.extend($scope, crudEditHandlers('task'));

		$scope.productBacklogDictionary = resourceDictionary('productbacklog');
		$scope.productBacklogDictionary.setItems($scope.productBacklogItems);

		/**************************************************
		 * Status Logging
		 **************************************************/

		var statusLogger;
		var startTime;
		var stopTime;
		var clickTime;
		$scope.statusLogging = false;
		$scope.task.statusLogs = $scope.task.statusLogs || [];

		var statusLogs = statusLog($scope.task.statusLogs, {lookUp: ['status']});
		console.log("statusLog is");
		console.log($scope.task.statusLogs);
		console.log("status log map is");
		console.log(statusLogs.getLookUp('status'));

		var prevLogTime = statusLogs.totalLogTime();
		$scope.lastStatusLog = statusLogs.lastLog();

		// if( !$scope.task.$id() ){
		// 	// find the staring status and
		// 	// and set that as the task status
		// 	var startStatus = $scope.statusDef[0];
		// 	statusLogs.push({
		// 		start: clickTime,
		// 		data: {
		// 			status: startStatus.key
		// 		}
		// 	});
		// }

		console.log("initial status logs");
		console.log(statusLogs.getLogs());
		console.log($scope.task.statusLogs);

		$scope.logger = prevLogTime;
		// console.log("log time total");
		// console.log($scope.logger);

		if( statusLogs.statusLogging() ){
			$scope.statusLogging = true;
			clickTime = $scope.lastStatusLog.start;
			statusLogger = $interval(
				function () {
					if( angular.isDefined(clickTime) ){
						$scope.logger = Date.now() - clickTime + prevLogTime;
					}
				},
				1000
			);
		}

		// /**************************************************
		//  * Callback when the logger starts
		//  * the callback should return a promise object
		//  * indicating the callback success
		//  **************************************************/
		// $scope.beforeLoggerStart = function (status, clickTime) {
		// 	$scope.setTaskStatus(status);
		// 	statusLogs.push({
		// 		start: clickTime,
		// 		data: {
		// 			status: status.key,
		// 			userId: task.assignedUserId
		// 		}
		// 	});
		// 	return $scope.task.$updateFields(
		// 		// {logs: statusLogs},
		// 		{statusLogs: statusLogs.getLogs()},
		// 		function (response) {
		// 			console.log("updated the log: clickTime : beforeLoggerStart");
		// 			console.log($scope.task.statusLogs);
		// 			console.log(response);
		// 		},
		// 		function (error) {
		// 			var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
		// 			i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
		// 			statusLogs.pop();
		// 			console.log("Failed to update the time log: clickTime : beforeLoggerStart");
		// 			return $q.reject("Error in time log updates");
		// 		}
		// 	);
		// };

		// /**************************************************
		//  * startLogger
		//  *
		//  * beforeLoggerStart : a callback that returns a promise object
		//  * - Logger should be started only if the callback succeeds
		//  **************************************************/
		// $scope.startLogger = function (beforeLoggerStart) {
		// 	$scope.statusLogging = true;
		// 	clickTime = Date.now();
		// 	if( angular.isFunction(beforeLoggerStart) ){
		// 		beforeLoggerStart('foobar', clickTime).then(
		// 			function (response) {
		// 				// start the logger
		// 				statusLogger = $interval(
		// 					function () {
		// 						if( angular.isDefined(clickTime) ){
		// 							$scope.logger = Date.now() - clickTime + prevLogTime;

		// 						}
		// 					},
		// 					1000
		// 				);
		// 				console.log("started the logger: startLogger2");
		// 			},
		// 			function (error) {
		// 				// reset logger state
		// 				$scope.statusLogging = false;
		// 				console.log("reset the logger state: startLogger2");
		// 			}
		// 		);
		// 	}
		// };

		/**************************************************
		 * Callback when the logger stops
		 * the callback should return a promise object
		 * indicating the callback success
		 **************************************************/
		var beforeLogStatus = function (status, clickTime, async) {
			var currentLastLog =  statusLogs.pop('status');
			// var currentLastLog = statusLogs.currentLastLog();

			if( currentLastLog ){
				currentLastLog.stop = clickTime;
				statusLogs.push(currentLastLog, 'status');
			}

			statusLogs.push({
				start: clickTime,
				data: {
					status: status.key,
					userId: task.assignedUserId
				}
			}, 'status');

			if( async ){
				return $scope.task.$updateFields(
					{statusLogs: statusLogs.getLogs()},
					function (response) {
						console.log("updated the log: clickTime");
						// console.log($scope.task);
						console.log($scope.task.statusLogs);
						console.log(response);
						// $scope.statusLogging = false;
						// destroyLogger();
						// prevLogTime = sumLogs(statusLogs);
						$scope.setTaskStatus(status);
						prevLogTime = statusLogs.totalLogTime();
					},
					function (error) {
						var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
						i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
						// discard the new status change
						statusLogs.pop();
						// delete the out time for previous status
						var lastLog = statusLogs.pop('status');
						delete lastLog.stop;
						statusLogs.push(lastLog, 'status');
						return $q.reject("Error in time log updates");
					}
				);

			}
			else {
				$scope.setTaskStatus(status);
				prevLogTime = statusLogs.totalLogTime();
				console.log("q is ");
				console.log($q);
				return $q.when(true);
			}

			// if( lastLog ){
			// 	lastLog.stop = clickTime;
			// 	statusLogs.push(lastLog);

			// 	return $scope.task.$updateFields(
			// 		{statusLogs: statusLogs.getLogs()},
			// 		function (response) {
			// 			console.log("updated the log: clickTime");
			// 			// console.log($scope.task);
			// 			console.log($scope.task.statusLogs);
			// 			console.log(response);
			// 			// $scope.statusLogging = false;
			// 			// destroyLogger();
			// 			// prevLogTime = sumLogs(statusLogs);
			// 			prevLogTime = statusLogs.totalLogTime();
			// 		},
			// 		function (error) {
			// 			var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
			// 			i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
			// 			var lastLog = statusLogs.pop();
			// 			delete lastLog.stop;
			// 			statusLogs.push(lastLog);
			// 			return $q.reject("Error in time log updates");
			// 		}
			// 	);
			// }
			// else {
			// 	return $q.when(true);;
			// }

		};

		/**************************************************
		 * logStatus
		 *
		 * log status
		 **************************************************/
		$scope.logStatus = function (status) {
			var async = ($scope.task.$id())? 1 : 0;
			_logStatus(status, beforeLogStatus, async);
		};

		var _logStatus = function (status, beforeLogStatus, async) {
			clickTime = Date.now();

			if( angular.isFunction(beforeLogStatus) && !$scope.isTaskStatus(status)){
				// beforeLogStatus(clickTime).then(
				beforeLogStatus(status, clickTime, async).then(
					function (response) {
						// stop the previous logger
						$scope.statusLogging = false;
						destroyLogger();
						console.log("stopped the previous logger: logStatus2");

						// Start a new logger
						$scope.statusLogging = true;
						statusLogger = $interval(
							function () {
								if( angular.isDefined(clickTime) ){
									$scope.logger = Date.now() - clickTime + prevLogTime;

								}
							},
							1000
						);
						console.log("started the next logger: startLogger2");
						console.log("statusLog is");
						console.log($scope.task.statusLogs);
						// var foolog = statusLog($scope.task.statusLogs, {lookUp: ['status']});
						console.log("status log map is");
						console.log(statusLogs.getLookUp('status'));

						// Start the timer again
						// $scope.beforeLoggerStart(status, clickTime).then(
						// 	function (response) {
						// 		// start the logger
						// 		$scope.statusLogging = true;
						// 		statusLogger = $interval(
						// 			function () {
						// 				if( angular.isDefined(clickTime) ){
						// 					$scope.logger = Date.now() - clickTime + prevLogTime;

						// 				}
						// 			},
						// 			1000
						// 		);
						// 		console.log("started the logger: startLogger2");
						// 	},
						// 	function (error) {
						// 		// reset logger state
						// 		$scope.statusLogging = false;
						// 		console.log("reset the logger state: startLogger2");
						// 	}
						// );

					},
					function (error) {
						console.log("error occured in saving status - logger: logStatus2");
					}
				);
			}
		};

		var destroyLogger = function () {
			if( angular.isDefined(statusLogger) ){
				$interval.cancel(statusLogger);
				statusLogger = undefined;
			}
		};

		$scope.$on('$destroy', function () {
			destroyLogger();
		});

		/**************************************************
		 * Status Widget
		 **************************************************/
		$scope.setTaskStatus = function (status) {
			$scope.task.status = status.key;
		};

		$scope.isTaskStatus = function (status) {
			return ($scope.task.status === status.key)? true : false;
		};

		$scope.setBtnClasses = function (status) {
			if( $scope.isTaskStatus(status) ){
				return status.btnclass.active
			}
			else {
				return status.btnclass.inactive
			}
		};

		/**************************************************
		 * Type Widget
		 **************************************************/
		$scope.setTaskType = function (type) {
			$scope.task.type = type.key;
		};

		$scope.isTaskType = function (type) {
			return ($scope.task.type === type.key)? true : false;
		};

		$scope.setBtnClassesForType = function (type) {
			if( $scope.isTaskType(type) ){
				return type.btnclass.active
			}
			else {
				return type.btnclass.inactive
			}
		};

		/**************************************************
		 * Setup 'Assign Product Backlog' widget
		 **************************************************/

		$scope.taskDictionary = resourceDictionary('tasks');

		$scope.backlogTaskMap = {};
		angular.forEach($scope.productBacklogItems, function(backlogItemId) {
			$scope.backlogTaskMap[backlogItemId] = [];
		});

		var getTotalTaskEstimate = function (tasks) {
			var totalTaskEstimate = 0;
			angular.forEach(tasks, function(task) {
				totalTaskEstimate = totalTaskEstimate + task.estimation;
			});
			return totalTaskEstimate;
		};

		var calculateBacklogTaskEstimates = function () {
			angular.forEach($scope.productBacklogItems, function (productBacklogItem) {
				var tasks = $scope.backlogTaskMap[productBacklogItem.$id()];
				productBacklogItem.tasks = tasks
				productBacklogItem.totalTaskEstimate = getTotalTaskEstimate(tasks);
				productBacklogItem.propertiesToDisplay = [
					{
						name : 'Estimation',
						value : productBacklogItem.estimation,
						icon : 'time',
						ordering : 1
					}
				];
			});
		};

		var setupTasks = function (tasks) {
			console.log("succeeded to fetch tasks for sprint backlog");
			console.log(tasks);
			$scope.taskDictionary.setItems(tasks);
			$scope.backlogTaskMap = _.groupBy(
				tasks,
				function (task) {
					return task.productBacklogItemId
				}
			);
			// angular.forEach(tasks, function(task) {
			// 	var backlogTasks = $scope.backlogTaskMap[task.productBacklogItemId];
			// 	if( angular.isDefined(backlogTasks) ){
			// 		if( backlogTasks.indexOf(task.$id()) === -1){
			// 			backlogTasks.push(task.$id());
			// 		}
			// 	}
			// });
		};

		Tasks.forProductBacklogItemIdList(
			$scope.productBacklogItems,
			function (tasks) {
				console.log("product backlog items are");
				console.log($scope.productBacklogItems);
				setupTasks(tasks);
				calculateBacklogTaskEstimates();
			}
		);


		$scope.viewProductBacklogItem = function (productBacklogItemId) {
			$location.path('/projects/'+project.$id()+'/productbacklog/'+productBacklogItemId);
		};

		$scope.canAssignBacklogItem = function (backlogItem) {
			if( backlogItem.totalTaskEstimate >= 0
			 && (backlogItem.estimation - backlogItem.totalTaskEstimate) >= $scope.task.estimation ) {
				return true;
			}
			else {
				return false;
			}
		};

		$scope.notAssigned = function (backlogItem) {
			return (backlogItem.$id() === $scope.task.productBacklogItemId )? false : true;
		};

		$scope.assignBacklogItem = function (backlogItem) {
			$scope.task.productBacklogItemId = backlogItem.$id();
		};

		$scope.unassignBacklogItem = function () {
			$scope.task.productBacklogItemId = undefined;
		};

		/**************************************************
		 * Setup 'Assign User' widget
		 **************************************************/
		$scope.assignedUser = (angular.isDefined(task.assignedUserId)) ? [task.assignedUserId] : [];

		$scope.isUnassignedUserFilter = function(user) {
			return $scope.project.isDevTeamMember(user.$id()) && !$scope.isAssignedUserFilter(user);
		};

		$scope.isAssignedUserFilter = function(user) {
			return ($scope.task.assignedUserId === user.$id())? true : false;
		};

		$scope.logform = function(form) {
			console.log(form);
		};

		$scope.$watchCollection('assignedUser', function (newAssignedUser, oldAssignedUser) {
			if( !angular.equals(newAssignedUser, oldAssignedUser) ){
				$scope.task.assignedUserId = newAssignedUser[0];
			}
		});

		// /**************************************************
		//  * On Save/Remove callbacks
		//  **************************************************/
		// $scope.onSave = function (savedTask) {
		// 	return {
		// 		key: 'crud.task.save.success',
		// 		type: 'success',
		// 		context: {id : savedTask.$id()}
		// 	};
		// 	// var projectId = $route.current.params.projectId;
		// 	// // var sprintId = $route.current.params.sprintId;
		// 	// var taskid = task.$id();
		// 	// if( angular.isDefined(taskid) ){
		// 	// 	$location.path('/projects/' + projectId + '/tasks/' + taskid);
		// 	// }
		// 	// else {
		// 	// 	$location.path('/projects/' + projectId + '/tasks');
		// 	// }
		// 	// $location.path('/admin/users');
		// };
		// $scope.onSaveError = function(error) {
		// 	return {
		// 		key: 'crud.task.save.error',
		// 		type: 'error',
		// 		context: {
		// 			error: error
		// 		}
		// 	};
		// 	// $scope.updateError = true;
		// };

		// $scope.onRemove = function () {
		// 	var projectId = $route.current.params.projectId;
		// 	var taskid = task.$id();
		// 	$location.path('/projects/' + projectId + '/tasks');
		// };
	}
]);