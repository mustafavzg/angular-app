angular.module('tasksnew', [
	'ngRoute',
	'resources.sprints',
	'resources.productbacklog',
	'resources.users',
	'resources.tasks',
	'resources.projects',
	'directives.userscombosearchadd',
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
		$scope.statusEnum = Tasks.statusEnum;
		// $scope.sprintBacklogItems = sprintBacklogItems;
		// $scope.teamMembers = teamMembers;

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));

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
		crudEditHandlers
	) {
		$scope.task = task;
		$scope.project = project;

		$scope.statusEnum = Tasks.statusEnum;
		$scope.statusDef = Tasks.statusDef;
		$scope.productBacklogItems = productBacklogItems;
		$scope.teamMembers = teamMembers;

		$scope.tasksCrudHelpers = {};
		angular.extend($scope.tasksCrudHelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		angular.extend($scope, crudEditHandlers('task'));

		$scope.productBacklogLookup = {};
		angular.forEach($scope.productBacklogItems, function (productBacklogItem) {
			$scope.productBacklogLookup[productBacklogItem.$id()] = productBacklogItem;
		});

		/**************************************************
		 * Status Widget
		 **************************************************/
		$scope.setTaskStatus = function (status) {
			$scope.task.status = status.key;
		}

		$scope.isTaskStatus = function (status) {
			return ($scope.task.status === status.key)? true : false;
		}

		$scope.setBtnClasses = function (status) {
			if( $scope.isTaskStatus(status) ){
				return status.btnclass.active
			}
			else {
				return status.btnclass.inactive
			}
		}

		/**************************************************
		 * Setup 'Assign Product Backlog' widget
		 **************************************************/
		angular.forEach($scope.productBacklogItems, function (productBacklogItem) {
			var productBacklogItemId = productBacklogItem.$id();
			// init total task estimate
			productBacklogItem.totalTaskEstimate = -1000;
			Tasks.forProductBacklogItemId(
				productBacklogItemId,
				function (tasks) {
					var productBacklogItem = $scope.productBacklogLookup[productBacklogItemId];
					productBacklogItem.tasks = tasks
					var totalTaskEstimate = 0;
					angular.forEach(tasks, function(task) {
						totalTaskEstimate = totalTaskEstimate + task.estimation;
					});
					productBacklogItem.totalTaskEstimate = totalTaskEstimate;
				},
				function (response) {
					console.log("Failed to fetch tasks for productbacklog item: " + productBacklogItemId);
				}
			);
			// properties to display for the backlog widget
			productBacklogItem.propertiesToDisplay = [
				{
					name : 'Estimation',
					value : productBacklogItem.estimation,
					icon : 'time',
					ordering : 1
				}
			];
		});

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