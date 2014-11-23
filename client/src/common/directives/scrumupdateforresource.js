angular.module('directives.scrumupdateforresource', [
	'ui.bootstrap',
	'directives.icon',
	'resources.scrumUpdates'
])

.directive('scrumupdateforresource', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/scrumupdateforresource.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				label: '@',
				resource: '=',
				date: '=',
				scrumupdates: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'ScrumUpdates',
				function ($scope, $element, $attrs, ScrumUpdates) {
					$scope.saveScrumUpdate = function(resource){
						console.log("Resource String=:\n");
						console.log(resource);
						console.log("\nInside saveScrumUpdate:\n");
						resource.showAddButton = true;
						if (resource.scrumText) {
							var successcb = function(){
								console.log("scrum saved successfully!!!");
							};
							var failurecb = function(){
								console.log("scrum cannot be saved!!!");
							};
							scrum = {};
							scrum.date = $scope.date;
							scrum.text = resource.scrumText;
							scrum.resource = resource.name;
							var currentDate = scrum.date;
							scrum.dateString = currentDate.toLocaleDateString();
							scrum.timeString = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
							scrum.userId = resource.$id();
							scrum.resourceId = resource.$id();
							scrum.plan = resource.planForDay;
							scrum.impediments = resource.impediments;
							resource.scrum = scrum;
							var scrumupdateobj = new ScrumUpdates(scrum);
							scrumupdateobj.$save(successcb, failurecb);
							$scope.scrumupdates.push(scrum);
							console.log("\nResource="+resource.toString()+"\n");
							resource.hasHistory = false;
							successcb = function(){
								console.log("resource saved successfully!!!");
							};
							failurecb = function(){
								console.log("resource cannot be saved!!!");
							};
						}
						resource.showPlanButton = false;
						resource.showUpdateButton = false;
						resource.showImpedimentsButton = false;
					};
					$scope.addScrumUpdate = function(resource){
						resource.showAddButton = false;
						resource.showPlanButton = true;
						resource.showUpdateButton = true;
						resource.showImpedimentsButton = true;
					};
					$scope.closeScrumUpdate = function(resource){
						resource.scrumText = "";
						resource.showAddButton = true;
						resource.hasHistory = false;
					};

					$scope.clearScrumUpdate = function(resource){
						resource.scrumText = "";
						resource.showAddButton = false;
						resource.hasHistory = true;
					};

					$scope.togglePlanButton = function(resource){
						resource.showPlanButton = !resource.showPlanButton;
					};
					$scope.toggleUpdateButton = function(resource){
						resource.showUpdateButton = !resource.showUpdateButton;
					};
					$scope.toggleImpedimentsButton = function(resource){
						resource.showImpedimentsButton = !resource.showImpedimentsButton;
					};
				}
			]

/*			link: function(scope, element, attrs, ngform) {
				console.log();
				scope.saveScrumUpdate = function(resource){
					resource.showAddButton = true;
					console.log(resource.scrumText);
					if (resource.scrumText) {
						var successcb = function(){
							console.log("scrum saved successfully!!!");
						};
						var failurecb = function(){
							console.log("scrum cannot be saved!!!");
						};
						scrum = {};
						scrum.date = new Date();
						scrum.text = resource.scrumText;
						scrum.resource = resource.name;
						var currentDate = scrum.date;
						scrum.dateString = currentDate.toLocaleDateString();
						scrum.timeString = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
						scrum.userId = user.$id();
						scrum.resourceId = resource.$id();
						resource.scrum = scrum;
						var scrumupdateobj = new ScrumUpdates(scrum);
						scrumupdateobj.$save(successcb, failurecb);
						resource.hasHistory = false;
						successcb = function(){
							console.log("resource saved successfully!!!");
						};
						failurecb = function(){
							console.log("resource cannot be saved!!!");
						};
					}
				};
				scope.addScrumUpdate = function(resource){
					resource.showAddButton = false;
				};
				scope.closeScrumUpdate = function(resource){
					resource.scrumText = "";
					resource.showAddButton = true;
					resource.hasHistory = false;
				};

				$scope.clearScrumUpdate = function(resource){
					resource.scrumText = "";
					resource.showAddButton = false;
					resource.hasHistory = true;
				};

			}*/
		};
	}
])
