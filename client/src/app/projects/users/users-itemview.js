angular.module('users-itemview',[
	'services.crud',
	'services.i18nNotifications',
	'users-edit-uniqueEmail',
	'users-edit-validateEquals',
	'resources.users',
	'resources.tasks',
	'resources.scrumUpdates',
	'directives.datecombofromto'
])

.controller('UsersItemViewCtrl', [
	'$scope',
	'$location',
	'user',
	'project',
	'Tasks',
	'ScrumUpdates',
	'crudListMethods',
	'i18nNotifications',
	'$q',
	function (
		$scope,
		$location,
		user,
		project,
		Tasks,
		ScrumUpdates,
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
			value : user.email
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
						},
						{
							name : 'Priority',
							value : $scope.tasks[i].priority,
							glyphiconclass : 'glyphicon glyphicon-star',
							icon : 'star',
							ordering : 1
						}
					];
					$scope.tasks[i].showAddButton = true;
				}
				$scope.fetchingtasks = false;
			},
			function (response) {
				$scope.fetchingtasks = false;
			}
		);*/

		/**************************************************
		 * Fetch scrum updates and crud helpers
		 **************************************************/
		$scope.fetchingscrumupdates = true;
		$scope.scrumupdates = [];
		/*ScrumUpdates.forUser(
			user.$id(),
			function (scrumupdates) {
				$scope.scrumupdates = scrumupdates;
				$scope.fetchingscrumupdates = false;
			},
			function (response) {
				$scope.fetchingscrumupdates = false;
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
		
		var scrumUpdates = $scope.scrumupdates;
		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		$scope.showAddButton = true;
		$scope.scrumDates = {};
		$scope.scrumDates.startdate = new Date('06/20/2014');
		$scope.scrumDates.enddate = new Date('06/23/2014');
		$scope.saveScrumUpdate = function(task){
			console.log("Scrum Update saved!!!");
			task.showAddButton = true;
			var successcb = function(){
				console.log("task saved successfully!!!");
			};
			var failurecb = function(){
				console.log("task cannot be saved!!!");
			};
			scrum = {};
			scrum.date = new Date();
			scrum.text = task.scrumText;
			scrumUpdates.push(scrum);
			task.$save(successcb, failurecb);			
		};
		$scope.addScrumUpdate = function(task){
			task.showAddButton = false;
		};

		$scope.closeScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = false;
		};

		$scope.clearScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = true;
		};

		$scope.dateRangeFilter = function(scrumUpdate){
			var scrumDate = new Date(scrumUpdate.date);
			if($scope.scrumDates.startdate && $scope.scrumDates.enddate){
				var startDate = new Date($scope.scrumDates.startdate);
				var endDate = new Date($scope.scrumDates.enddate);
				return ((startDate <= scrumDate) && (endDate >= scrumDate));
			}
			return true;
		};

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