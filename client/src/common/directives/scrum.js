angular.module('directives.scrum', [
	'ui.bootstrap'
])
.directive('scrum', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/scrum.tpl.html',
			replace: true,
			scope: {
				resource : '='
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				function ($scope, $element, $attrs) {
					console.log("LINKING THE SCRUM!!!!");
					var resource = $scope.resource;
					resource.scrum = resource.scrum || [];
					$scope.addScrumUpdate = function(){
						var scrumUpdate = this.scrumUpdate;
						console.log("username= test user, scrumUpdate="+scrumUpdate);
						resource.scrum.push({Update : scrumUpdate, User : 'test'});
						var successcb = function(){
							console.log("saved successfully!!!");
						};
						var failurecb = function(){
							console.log("could not save");
						};
						resource.$update(successcb, failurecb);
					};
				}
			]	
		};
	}
])
