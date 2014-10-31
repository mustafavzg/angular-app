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
	'directives.pieChart',
	'services.crud',
	'services.resourceDictionary',
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
		i18nNotifications
	) {


///////////////////////////


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
				data.push({
					userStatus: burst.data.status + ", " + burst.data.userId,
					start: burst.start,
					stop: burst.stop || Date.now(),
					// stop: burst.stop,
					color: task.getStatusDef(burst.data.status).color
				});
			});
			console.log("Task data:\n");
			console.log("Data=\n"+data);
			return data;
		};

		$scope.tasksGanttUpdateValidator = function (item, update) {
			var task = item;
			return 1;
		};

		$scope.taskToGanttData = function (task) {

		};






		// /**************************************************
		//  * gantt experiment end
		//  **************************************************/
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
			return (!!startTime)? true : false;
		};

		var taskTimer;
		var startTime;
		var stopTime;
		$scope.timerRunning = false;

		var sumBursts = function (taskBursts) {
			var burstTime = 0;
			angular.forEach(taskBursts, function(burst) {
				// console.log("calculating burst time");
				// console.log(burst);
				// console.log(burstTime);
				// console.log(burst.stop - burst.start);
  				// var stopTime = burst.stop || Date.now();
				// burstTime += stopTime - burst.start;
				// burst.data =  {
				// 	status: $scope.task.status,
				// 	userId: $scope.task.assignedUserId
				// };

				if( burst.stop ){
					burstTime += burst.stop - burst.start;
				}
			});
			return burstTime;
		};

		var taskBursts = $scope.task.bursts || [];
		var lastBurst = taskBursts.slice(-1)[0];
		var prevBurstTime = sumBursts(taskBursts);

		console.log(taskBursts);

		$scope.timer = prevBurstTime;
		console.log("burst time total");
		console.log($scope.timer);

		if( lastBurst && !lastBurst.stop ){
			$scope.timerRunning = true;
			startTime = lastBurst.start;
			taskTimer = $interval(
				function () {
					if( angular.isDefined(startTime) ){
						$scope.timer = Date.now() - startTime + prevBurstTime;
					}
				},
				100
			);
		}

		$scope.startTimer = function () {
			$scope.timerRunning = true;
			startTime = Date.now();
			taskBursts.push({
				start: startTime,
				data: {
					status: task.status,
					userId: task.assignedUserId
				}
			});
			$scope.task.$updateFields(
				{bursts: taskBursts},
				function (response) {
					console.log("updated the burst: startTime");
					console.log($scope.task);
					console.log(response);
					taskTimer = $interval(
						function () {
							if( angular.isDefined(startTime) ){
								$scope.timer = Date.now() - startTime + prevBurstTime;

							}
						},
						100
					);
				},
				function (error) {
					var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
					i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					taskBursts.pop();
					$scope.timerRunning = false;
				}
			);

		};

		// $scope.stopWatch = function (timeinmills) {
		// 	var seconds = timeinmills / 1000;
		// };

		// $scope.stopWatchFilter = function (timeinmills) {
		// 	var timeindeciseconds = Math.floor(timeinmills / 100);
		// 	var deciseconds = timeindeciseconds % 10;

		// 	var timeinseconds = Math.floor(timeindeciseconds / 10);
		// 	var seconds = timeinseconds % 60;

		// 	var timeinminutes = Math.floor(timeinseconds / 60);
		// 	var minutes = timeinminutes % 60;

		// 	var timeinhours = Math.floor(timeinminutes / 60);
		// 	var hours = timeinhours % 24;

		// 	var timeindays = Math.floor(timeinhours / 24);
		// 	var days = timeindays;

		// 	return days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds, " + deciseconds + " deciseconds, ";
		// };

		$scope.stopTimer = function () {
			stopTime = Date.now();

			var lastBurst =  taskBursts.pop();
			lastBurst.stop = stopTime;
			taskBursts.push(lastBurst);
			$scope.task.$updateFields(
				{bursts: taskBursts},
				function (response) {
					console.log("updated the burst: stopTime");
					console.log($scope.task);
					console.log(response);
					$scope.timerRunning = false;
					destroyTimer();
					prevBurstTime = sumBursts(taskBursts);
				},
				function (error) {
					var notification = $scope.taskCrudNotificationHelpers.onUpdateError(error);
					i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					var lastBurst = taskBursts.pop();
					delete lastBurst.stop;
					taskBursts.push(lastBurst);
				}
			);
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
		_
	) {



		$scope.task = task;
		$scope.project = project;

		$scope.statusEnum = Tasks.statusEnum;

		// status and type
		// $scope.statusDef = Tasks.statusDef;
		// $scope.typeDef = Tasks.typeDef;
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