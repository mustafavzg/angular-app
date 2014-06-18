angular.module('sprints', [
	'ngRoute',
	'resources.sprints',
	'resources.tasks',
	'directives.datecombofromto',
	'directives.propertybar',
	'directives.icon',
	'directives.actionicon',
	'directives.warningblock',
	'ui.bootstrap',
	'services.crud',
	'services.i18nNotifications',
	'services.dictionary',
	'services.locationHistory',
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
				'i18nNotifications',
				'$location',
				'$q',
				function($route, Sprints, i18nNotifications, $location, $q){
					return Sprints.getById($route.current.params.itemId).then(
						function (sprint) {
							if( sprint.isExpired() ){
								var projectId = $route.current.params.projectId;
								i18nNotifications.pushForNextRoute('crud.sprint.expired.error', 'error', {});
								$location.path('/projects/' + projectId + '/sprints/' + sprint.$id());
								// return $q.reject("Cannot Edit Sprint");
								return null;
							}
							else {
								return sprint;
							}
						}
					);
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
	'locationHistory',
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
		locationHistory,
		_
	){

		$scope.sprint = sprint;
		$scope.project = project;

		$scope.sprintsCrudHelpers = {};
		angular.extend($scope.sprintsCrudHelpers, crudListMethods('/projects/'+project.$id()+'/sprints'));

		$scope.editToolTip = function () {
			return ($scope.sprint.isExpired()) ? "Cannot edit an expired sprint" : "Edit Sprint";
		}

		$scope.sprint.attributesToDisplay = {
			status : {
				name : 'Status',
				// value : sprint.status,
				value : sprint.getStatusPretty(),
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
	'Tasks',
	'crudListMethods',
	'crudEditHandlers',
	'dictionary',
	'i18nNotifications',
	'_',
	'moment',
	function($scope, $location, project, sprint, productBacklog, Tasks, crudListMethods, crudEditHandlers, dictionary, i18nNotifications, _, moment){

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
		angular.extend($scope, crudEditHandlers('sprint'));

		$scope.manageBacklog = function () {
			$location.path('/projects/'+project.$id()+'/productbacklog');
		};

		$scope.newBacklogItem = function () {
			$scope.nonCrudRouteChange('/projects/'+project.$id()+'/productbacklog/new');
			// if( $scope.canSave() ){
			// 	i18nNotifications.pushForCurrentRoute('crud.unsaved', 'error', {});
			// }
			// else {
			// 	$location.path('/projects/'+project.$id()+'/productbacklog/new');
			// }
		};

		$scope.newTask = function () {
			$scope.nonCrudRouteChange('/projects/'+project.$id()+'/tasks/new');
		};

		/**************************************************
		 * Sprint backlog widget
		 **************************************************/
		$scope.sprint.sprintBacklog = $scope.sprint.sprintBacklog || [];

		$scope.productBacklogLookup = {};
		angular.forEach($scope.productBacklog, function (productBacklogItem) {
			$scope.productBacklogLookup[productBacklogItem.$id()] = productBacklogItem;
		});

		$scope.viewProductBacklogItem = function (productBacklogItemId) {
			$location.path('/projects/'+project.$id()+'/productbacklog/'+productBacklogItemId);
		};

		// $scope.canAddBacklogItem = function (backlogItem) {
		// 	return (backlogItem.estimation > $scope.remainingEstimate)? false : true;
		// };

		$scope.addBacklogItem = function (backlogItem) {
			$scope.sprint.sprintBacklog.push(backlogItem.$id());
			// console.log("Added backlog item");
			// console.log($scope.sprint);
			// $scope.calculateEstimates();
		};

		$scope.canRemoveBacklogItem = function (backlogItemId) {
			var tasks = $scope.sprint.sprintTasks[backlogItemId] || [];
			return (tasks.length > 0)? false : true;
		};

		$scope.removeBacklogItem = function (backlogItemId) {
			$scope.sprint.sprintBacklog.splice($scope.sprint.sprintBacklog.indexOf(backlogItemId),1);
			// $scope.calculateEstimates();
		};

		$scope.backlogItemNotSelected = function (productBacklogItem) {
			return $scope.sprint.sprintBacklog.indexOf(productBacklogItem.$id())===-1;
		};

		// $scope.estimationInTotal = function () {
		// 	var totalEstimation = 0;
		// 	angular.forEach(sprint.sprintBacklog, function (backlogItemId) {
		// 		totalEstimation += $scope.productBacklogLookup[backlogItemId].estimation;
		// 	});
		// 	return totalEstimation;
		// };

		// $scope.remainingEstimation = function (totalEstimation) {
		// 	var startMoment = moment($scope.sprint.startdate);
		// 	var endMoment = moment($scope.sprint.enddate);
		// 	// var days = endMoment.diff(startMoment, 'days');
		// 	var days = endMoment.businessDiff(startMoment);
		// 	var workHoursPerDay = 8;
		// 	var estimationLimit = $scope.sprint.capacity * days * workHoursPerDay;
		// 	var remainingEstimation = estimationLimit - totalEstimation;
		// 	return remainingEstimation;
		// };

		// $scope.notSelected = function (productBacklogItem) {
		// 	return $scope.sprint.sprintBacklog.indexOf(productBacklogItem.$id())===-1;
		// };

		// $scope.calculateEstimates = function () {
		// 	$scope.totalEstimate = $scope.estimationInTotal();
		// 	$scope.remainingEstimate = $scope.remainingEstimation($scope.totalEstimate);
		// 	$scope.sprintLimit = $scope.totalEstimate + $scope.remainingEstimate;
		// }

		// $scope.sprintLimitExceeded = function () {
		// 	return ($scope.remainingEstimate < 0)? true : false;
		// }

		// $scope.calculateEstimates();

		// $scope.$watch('sprint.capacity', function (newVal, oldVal) {
		// 	if( newVal !== oldVal ){
		// 		$scope.calculateEstimates();
		// 	}
		// });

		// $scope.$watchGroup(['sprint.startdate', 'sprint.enddate'], function (newGroup, oldGroup, scope) {
		// 	if( !angular.equals(newGroup, oldGroup) ){
		// 		$scope.calculateEstimates();
		// 	}
		// });

		/**************************************************
		 * Sprint backlog widget
		 **************************************************/

		$scope.sprint.sprintTasks = $scope.sprint.sprintTasks || {};
		$scope.taskDictionary = dictionary;

		$scope.getTaskIds = function (backlogTaskMap) {
			return _.chain(backlogTaskMap).values().flatten().uniq().value();
			// return _.union(_.values(backlogTaskMap));
		}

		// build the sprint Tasks initially
		Tasks.getByIds(
			$scope.getTaskIds($scope.sprint.sprintTasks),
			function (tasks) {
				console.log("setting up sprint tasks ");
				console.log(tasks);
				setupTasks(tasks);
				$scope.calculateEstimates();
			}
		);

		$scope.backlogTaskMap = {};
		angular.forEach($scope.sprint.sprintBacklog, function(backlogItemId) {
			$scope.backlogTaskMap[backlogItemId] = [];
		});

		$scope.$watchCollection('sprint.sprintBacklog', function (newSprintBacklog, oldSprintBacklog) {
			if( !angular.equals(newSprintBacklog, oldSprintBacklog) ){
				// fetch the tasks for the newly added backlog
				var addedItems = _.difference(newSprintBacklog, oldSprintBacklog);
				if( addedItems.length ){
					Tasks.forProductBacklogItemIdList(
						addedItems,
						function (tasks) {
							console.log("sprint backlog is ");
							console.log($scope.sprint.sprintBacklog);
							setupTasks(tasks);
						}
					);
				}

			}
		});

		var setupTasks = function (tasks) {
			console.log("succeeded to fetch tasks for sprint backlog");
			console.log(tasks);
			$scope.taskDictionary.build(tasks);
			angular.forEach(tasks, function(task) {
				var backlogTasks = $scope.backlogTaskMap[task.productBacklogItemId];
				if( angular.isDefined(backlogTasks) ){
					if( backlogTasks.indexOf(task.$id()) === -1){
						backlogTasks.push(task.$id());
					}
				}
				// $scope.backlogTaskMap[task.productBacklogItemId].push(task.$id());
				task.propertiesToDisplay = [
					{
						name : 'Estimation',
						value : task.estimation,
						// glyphiconclass : 'glyphicon glyphicon-time',
						icon : 'time',
						ordering : 1
					},
					{
						name : 'Status',
						value : task.status,
						// glyphiconclass : 'glyphicon glyphicon-time',
						icon : 'sound-stereo',
						ordering : 2
					}
				];
			});
		};

		Tasks.forProductBacklogItemIdList(
			$scope.sprint.sprintBacklog,
			function (tasks) {
				console.log("sprint backlog is ");
				console.log($scope.sprint.sprintBacklog);
				setupTasks(tasks);

				// console.log("succeeded to fetch tasks for sprint backlog");
				// console.log(tasks);
				// $scope.taskDictionary.build(tasks);
				// angular.forEach(tasks, function(task) {
				// 	$scope.backlogTaskMap[task.productBacklogItemId].push(task.$id());
				// 	task.propertiesToDisplay = [
				// 		{
				// 			name : 'Estimation',
				// 			value : task.estimation,
				// 			// glyphiconclass : 'glyphicon glyphicon-time',
				// 			icon : 'time',
				// 			ordering : 1
				// 		},
				// 		{
				// 			name : 'Status',
				// 			value : task.status,
				// 			// glyphiconclass : 'glyphicon glyphicon-time',
				// 			icon : 'sound-stereo',
				// 			ordering : 2
				// 		}
				// 	];
				// });
			}
		);

		// angular.forEach($scope.task, function (task) {
		// 	$scope.taskDictionary[task.$id()] = task;
		// });

		$scope.viewTask = function (task) {
			$location.path('/projects/'+project.$id()+'/tasks/'+task.$id());
		};

		$scope.canAddTask = function (task) {
			return (task.estimation > $scope.remainingEstimate)? false : true;
		};

		$scope.canRemoveTask = function (task) {
			// return (task.estimation > $scope.remainingEstimate)? false : true;
			return true;
		};

		$scope.addTask = function (task) {
			// $scope.sprint.sprintTasks.push(task.$id());
			var tasks = $scope.sprint.sprintTasks[task.productBacklogItemId] || [];
			tasks.push(task.$id());
			$scope.sprint.sprintTasks[task.productBacklogItemId] = tasks;
			$scope.calculateEstimates();
		};

		$scope.removeTask = function (task) {
			// $scope.sprint.sprintTasks.splice($scope.sprint.sprintTasks.indexOf(task.$id()),1);
			var tasks = $scope.sprint.sprintTasks[task.productBacklogItemId] || [];
			tasks.splice(tasks.indexOf(task.$id()),1);
			// if( angular.isArray(tasks) && tasks.length > 0 ){
			// 	tasks.splice(tasks.indexOf(task.$id()),1);
			// }

			$scope.calculateEstimates();
		};

		$scope.sprintHasTasks = function () {
			var tasks = $scope.getTaskIds($scope.sprint.sprintTasks);
			return (tasks.length)? true : false;
		}

		$scope.estimationInTotal = function () {
			var totalEstimation = 0;
			var taskIds = $scope.getTaskIds($scope.sprint.sprintTasks);
			var tasks = $scope.taskDictionary.lookUp(taskIds);
			console.log("tasks in sprint");
			console.log(tasks);
			console.log(taskIds);
			console.log($scope.sprint.sprintTasks);
			angular.forEach(tasks, function (task) {
				totalEstimation += task.estimation;
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

		$scope.notSelected = function (task) {
			var tasks = $scope.sprint.sprintTasks[task.productBacklogItemId] || [];
			return tasks.indexOf(task.$id())===-1;
			// return $scope.sprint.sprintTasks.indexOf(task.$id())===-1;
		};

		$scope.backlogItemNoTasks = function (backlogItemId) {
			var backlogTasks = $scope.sprint.sprintTasks[backlogItemId];
			if( angular.isDefined(backlogTasks) ){
				return backlogTasks.length;
			}
			return 0;
		};

		$scope.calculateEstimates = function () {
			$scope.totalEstimate = $scope.estimationInTotal();
			$scope.remainingEstimate = $scope.remainingEstimation($scope.totalEstimate);
			$scope.sprintLimit = $scope.totalEstimate + $scope.remainingEstimate;
		}

		$scope.sprintLimitExceeded = function () {
			return ($scope.remainingEstimate < 0)? true : false;
		}

		// $scope.calculateEstimates();

		// $scope.$watch('sprint.capacity', function (newVal, oldVal) {
		// 	if( newVal !== oldVal ){
		// 		$scope.calculateEstimates();
		// 	}
		// });

		$scope.$watchGroup(['sprint.capacity', 'sprint.startdate', 'sprint.enddate'], function (newGroup, oldGroup, scope) {
			if( !angular.equals(newGroup, oldGroup) ){
				$scope.calculateEstimates();
			}
		});

		// /**************************************************
		//  * On save call backs
		//  **************************************************/

		// console.log("the location object");
		// console.log($location);
		// $scope.onSave = function (savedSprint) {
		// 	return {
		// 		key: 'crud.sprint.save.success',
		// 		type: 'success',
		// 		context: {id : savedSprint.$id()}
		// 	};

		// 	// $location.path('/projects/'+project.$id()+'/sprints/'+$scope.sprint.$id());
		// 	// var sprintId = sprint.$id();
		// 	// if( angular.isDefined(sprintId) ){
		// 	// 	$location.path('/projects/' + project.$id() + '/sprints/' + sprintId);
		// 	// }
		// 	// else {
		// 	// 	$location.path('/projects/' + project.$id() + '/sprints/');
		// 	// }
		// };

		// $scope.onSaveError = function (error) {
		// 	return {
		// 		key: 'crud.sprint.save.error',
		// 		type: 'error',
		// 		context: {
		// 			error: error
		// 		}
		// 	};
		// 	// $scope.updateError = true;
		// };

	}
]);