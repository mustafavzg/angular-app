angular.module('users-itemview',[
	'services.crud',
	'services.i18nNotifications',
	'users-edit-uniqueEmail',
	'users-edit-validateEquals',
	'resources.users',
	'resources.tasks'
])

.controller('UsersItemViewCtrl', [
	'$scope',
	'$location',
	'user',
	'project',
	'Tasks',
	'crudListMethods',
	'i18nNotifications',
	'$q',
	function (
		$scope,
		$location,
		user,
		project,
		Tasks,
		crudListMethods,
		i18nNotifications,
		$q
	) {

		$scope.user = user;

		$scope.userscrudhelpers = {};
		angular.extend($scope.userscrudhelpers, crudListMethods('/projects/'+project.$id()+'/users'));


		$scope.user.attributesToDisplay = {};
		$scope.user.attributesToDisplay.username = {
			name : 'Username',
			value : user.username
		};

		/**************************************************
		 * Fetch task and crud helpers
		 **************************************************/
		$scope.fetchingtasks = true;
		$scope.tasks = [];
		/*Tasks.forUser(
			user.$id(),
			function (tasks) {
				$scope.tasks = tasks;
				for(var i=0;i<tasks.length;i++){
					$scope.tasks[i].propertiesToDisplay = [
						{
							name : 'Estimation',
							value : $scope.tasks[i].estimation,
							glyphiconclass : 'glyphicon glyphicon-time',
							icon : 'time',
							ordering : 1
						}
					];
				}
				$scope.fetchingtasks = false;
			},
			function (response) {
				// $scope.tasks = tasks;
				// failed to fetch tasks
				$scope.fetchingtasks = false;
			}
		);*/
		$scope.tasks = [
			{
				Name : 'Sample Task 1',
				Description : 'This is a sample task 1',
				Priority : 1,
				Estimation : 100,
				propertiesToDisplay : [
					{
						name : 'Estimation',
						value : 50,
						glyphiconclass : 'glyphicon glyphicon-time',
						icon : 'time',
						ordering : 1
					},
					{
						name : 'Priority',
						value : 1,
						glyphiconclass : 'glyphicon glyphicon-star',
						icon : 'star',
						ordering : 1
					}
				],
				showAddButton : true
			},
			{
				Name : 'Sample Task 2',
				Description : 'This is a sample task 2',
				Priority : 2,
				Estimation : 100,
				propertiesToDisplay : [
					{
						name : 'Estimation',
						value : 100,
						glyphiconclass : 'glyphicon glyphicon-time',
						icon : 'time',
						ordering : 1
					},
					{
						name : 'Priority',
						value : 1,
						glyphiconclass : 'glyphicon glyphicon-star',
						icon : 'star',
						ordering : 1
					}
				],
				showAddButton : true
			}
		];
		$scope.scrumupdates = [
			{
				date : '06/17/2014',
				text : 'Update for the day!!!'
			},
			{
				date : '06/18/2014',
				text : 'Update for the day!!!'
			},
			{
				date : '06/19/2014',
				text : 'Update for the day!!!'
			},
			{
				date : '06/20/2014',
				text : 'Update for the day!!!'
			},
			{
				date : '06/21/2014',
				text : 'Update for the day!!!'
			}
		];
		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		$scope.showAddButton = true;
		$scope.saveScrumUpdate = function(task){
			console.log("Scrum Update saved!!!");
			task.showAddButton = true;
		}
		$scope.addScrumUpdate = function(task){
			console.log("Adding Scrum Update!!!");
			task.showAddButton = false;
		}
		$scope.startdate = "06/19/2014";
		$scope.enddate = "06/21/2014";
		$scope.dateRangeFilter = function(scrumUpdate){
			console.log("Hi here (inside dateRangeFilter)!!!");
			var scrumDate = new Date(scrumUpdate.date);
			if($scope.startdate && $scope.enddate){
				console.log("Hi here!!!");
				var startDate = new Date($scope.startdate);
				var endDate = new Date($scope.enddate);
				return ((startDate <= scrumDate) && (endDate >= scrumDate));
			}
			return 1;
		}
		// $q.when(Tasks.forUser(user.$id())).then(
		// 	function (tasks) {
		// 		$scope.tasks = tasks;
		// 		$scope.fetchingtasks = false;
		// 	}
		// );

		// $scope.manageTasks = function (project) {
		// 	$location.path('/projects/'+project.$id()+'/tasks');
		// };

	}
]);