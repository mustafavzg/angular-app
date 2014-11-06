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
							resource.scrum = scrum;
							var scrumupdateobj = new ScrumUpdates(scrum);
							scrumupdateobj.$save(successcb, failurecb);
							$scope.scrumupdates.push(scrum);
							resource.hasHistory = false;
							successcb = function(){
								console.log("resource saved successfully!!!");
							};
							failurecb = function(){
								console.log("resource cannot be saved!!!");
							};
						}
					};
					$scope.addScrumUpdate = function(resource){
						resource.showAddButton = false;
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
