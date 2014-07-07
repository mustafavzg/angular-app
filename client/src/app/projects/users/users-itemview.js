angular.module('users-itemview',[
	'services.crud',
	'services.i18nNotifications',
	'users-edit-uniqueEmail',
	'users-edit-validateEquals',
	'resources.users',
	'resources.tasks',
	'resources.scrumUpdates',
	'directives.datecombofromto',
	'underscore'
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
	'_',
	function (
		$scope,
		$location,
		user,
		project,
		Tasks,
		ScrumUpdates,
		crudListMethods,
		i18nNotifications,
		$q,
		_
	) {

		$scope.user = user;
		console.log("user ID="+user.$id());

		$scope.userscrudhelpers = {};
		angular.extend($scope.userscrudhelpers, crudListMethods('/projects/'+project.$id()+'/users'));

		$scope.user.attributesToDisplay = {};
		$scope.user.attributesToDisplay.username = {
			name : 'Username',
			value : user.username
		};

		$scope.viewTask = function (task) {
			$location.path('/projects/'+project.$id()+'/tasks/'+task.$id());
		};
		//var scrumUpdate = new ScrumUpdates();

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
		/**************************************************
		 * Fetch task and crud helpers
		 **************************************************/
		$scope.fetchingtasks = true;
		$scope.tasks = [];
		Tasks.forUser(
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
		);

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
		);
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
		];*/
		$scope.scrumupdates = [
			{
				date : new Date('06/30/2014'),
				text : 'Update for the day!!!',
				task : 'Task 1'
			},
			{
				date : new Date('07/01/2014'),
				text : 'Update for the day!!!',
				task : 'Task 1'
			},
			{
				date : new Date('07/02/2014'),
				text : 'Update for the day!!!',
				task : 'Task 2'
			},
			{
				date : new Date('07/03/2014'),
				text : 'Update for the day!!!',
				task : 'Task 3'
			},
			{
				date : new Date('07/04/2014'),
				text : 'Update for the day!!!',
				task : 'Task 4'
			}
		];
		var allScrumUpdates = $scope.scrumupdates;
		/*var indexedScrumUpdates = [];
		$scope.updatesToFilter = function() {
			indexedScrumUpdates = [];
			return $scope.scrumupdates;
		};

		$scope.filterUpdates = function(update) {
			var updateIsNew = indexedScrumUpdates.indexOf(update.task) == -1;
			if (updateIsNew) {
				indexedScrumUpdates.push(update.task);
			}
			return updateIsNew;
		}*/

		$scope.tasklevelscrumupdates = _.groupBy($scope.scrumupdates, "task");
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
			scrum.task = task.name;
			//scrumUpdates.push(scrum);
			task.scrum = scrum;
			$scope.scrumupdates.push(scrum);
			console.log($scope.scrumupdates);
			/*scrumUpdate.user = user;
			scrumUpdate.date = scrum.date;
			scrumUpdate.task = task;
			scrumUpdate.text = task.scrumText;
			scrumUpdate.$save(successcb, failurecb);*/
			task.$save(successcb, failurecb);			
		};
		$scope.addScrumUpdate = function(task){
			task.showAddButton = false;
		};

		$scope.closeScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = true;
		};

		$scope.clearScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = false;
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

		$scope.$watchCollection('scrumupdates', function(){
			console.log("inside watch expr");
			$scope.tasklevelscrumupdates = _.groupBy($scope.scrumupdates, "task");
			console.log($scope.tasklevelscrumupdates);
			console.log($scope.scrumupdates);
		});

		$scope.$watchCollection('scrumDates', function(){
			var filteredUpdates = [];
			// Iterate through the scrum updates and filter only those updates which
			// are in the current date range.
			for(var taskIndex in allScrumUpdates){
				var currentUpdate = allScrumUpdates[taskIndex];
				var currentDate = new Date(currentUpdate.date);
				var startDate = new Date($scope.scrumDates.startdate);
				var endDate = new Date($scope.scrumDates.enddate);
				// check whether the update date is between startdate and enddate
				if(currentDate >= startDate && currentDate <= endDate){
					filteredUpdates.push(currentUpdate);
				}
			}
			$scope.tasklevelscrumupdates = _.groupBy(filteredUpdates, "task");
		});
		console.log($scope.tasklevelscrumupdates);
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