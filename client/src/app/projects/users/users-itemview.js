angular.module('users-itemview',[
	'services.crud',
	'services.i18nNotifications',
	'users-edit-uniqueEmail',
	'users-edit-validateEquals',
	'resources.users',
	'resources.tasks',
	'resources.scrumUpdates',
	'directives.datecombofromto',
	'underscore',
	'filters.groupBy'
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
	'groupByFilter',
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
		_,
		groupByFilter
	) {

		$scope.user = user;

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
							//glyphiconclass : 'glyphicon glyphicon-time',
							icon : 'time',
							ordering : 1
						},
						{
							name : 'Priority',
							value : $scope.tasks[i].priority,
							//glyphiconclass : 'glyphicon glyphicon-star',
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

		var allScrumUpdates = [];
		ScrumUpdates.forUser(
			user.$id(),
			function (scrumupdates) {
				$scope.scrumupdates = scrumupdates;
				$scope.fetchingscrumupdates = false;
				allScrumUpdates = $scope.scrumupdates;
				$scope.scrumupdates = allScrumUpdates;
			},
			function (response) {
				$scope.fetchingscrumupdates = false;
			}
		);

		$scope.taskscrudhelpers = {};
		angular.extend($scope.taskscrudhelpers, crudListMethods('/projects/'+project.$id()+'/tasks'));
		$scope.showAddButton = true;
		$scope.scrumDates = {};
		var todaysDate = new Date();
		$scope.scrumDates.startdate = todaysDate;
		$scope.scrumDates.startdate.setDate(todaysDate.getDate() - 7);
		todaysDate = new Date();
		$scope.scrumDates.enddate = todaysDate;

		$scope.saveScrumUpdate = function(task){
			task.showAddButton = true;
			console.log(task.scrumText);
			if (task.scrumText) {
				var successcb = function(){
					console.log("scrum saved successfully!!!");
				};
				var failurecb = function(){
					console.log("scrum cannot be saved!!!");
				};
				scrum = {};
				scrum.date = new Date();
				scrum.text = task.scrumText;
				scrum.task = task.name;
				var currentDate = scrum.date;
				scrum.dateString = currentDate.toLocaleDateString();
				scrum.timeString = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
				scrum.userId = user.$id();
				scrum.taskId = task.$id();
				task.scrum = scrum;
				$scope.scrumupdates.push(scrum);
				var scrumupdateobj = new ScrumUpdates(scrum);
				scrumupdateobj.$save(successcb, failurecb);
				task.hasHistory = false;
				successcb = function(){
					console.log("task saved successfully!!!");
				};
				failurecb = function(){
					console.log("task cannot be saved!!!");
				};
			}
		};
		$scope.addScrumUpdate = function(task){
			task.showAddButton = false;
			ScrumUpdates.forTask(
				task.$id(),
				function (scrumupdates) {
					console.log("Scrum Updates = \n");
					console.log(scrumupdates);
					task.hasHistory = scrumupdates.length > 0;
					task.taskUpdates = scrumupdates;
			 	},
				function (response) {
					$scope.fetchingscrumupdates = false;
				}
			);
			
		};
		$scope.closeScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = true;
			task.hasHistory = false;
		};

		$scope.clearScrumUpdate = function(task){
			task.scrumText = "";
			task.showAddButton = false;
			task.hasHistory = true;
		};


		$scope.$watchCollection('scrumupdates', function(){
			$scope.scrumDates.startdate = new Date($scope.scrumDates.startdate);
			$scope.scrumDates.enddate = new Date($scope.scrumDates.enddate);
		});

		$scope.$watchCollection('scrumDates', function(newObj, oldObj){
			// Check equality just to be sure, as listeners are fired atleast
			// once during initialization even if the object has not changed
			if( !angular.equals(newObj, oldObj) ){
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
						var dateString = currentDate.toLocaleDateString();
						currentUpdate.dateString = dateString;
						var timeString = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
						currentUpdate.timeString = timeString;
						filteredUpdates.push(currentUpdate);
					}
				}
				$scope.scrumupdates = filteredUpdates;
			}
		});

		$scope.$watchCollection('scrumupdates', function (newUpdates, oldUpdates) {
			if (!angular.equals(newUpdates, oldUpdates)) {
				$scope.groupedScrumUpdates = groupByFilter($scope.scrumupdates, "dateString", "task");
			};
		});

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