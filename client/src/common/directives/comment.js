angular.module('directives.comment', [
	'ui.bootstrap'
])
.directive('comment', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/comment.tpl.html',
			replace: true,
			scope: {
				resource : '='
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				function ($scope, $element, $attrs) {
					console.log("LINKING THE COMMENTS!!!!");
					var project = $scope.resource;
					project.comments = project.comments || [];
					$scope.addComment = function(){
						var comment = this.newcomment;
						console.log("username= test user, comment="+comment);
						project.comments.push({Comment : comment, User : 'test'});
						var successcb = function(){
							console.log("saved successfully!!!");
						};
						var failurecb = function(){
							console.log("could not save");
						};
						project.$update(successcb, failurecb);
					};
				}
			]	
		};
	}
])
