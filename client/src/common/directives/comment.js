angular.module('directives.comment', [
	'ui.bootstrap',
	'directives.icon',
	'resources.comment',
	
])
.directive('comment', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/comment.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				label: '@',
				forResource : '@',
				resourceId : '@',	
				date: '=',
				//comments: '=?'
				userId: '@'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Comments',
				function ($scope, $element, $attrs,Comments) {
					if(!$scope.comments)
					{$scope.comments = [];}
					
						/* resources : {
 							taskId : 123
 							projectId : 456	
						} */
						var resourceId = $scope.resourceId;
						var forResource = $scope.forResource;
						$scope.addComment = function(commentVal){
						
						if(commentVal){
							var now = new Date();
							tagObj = {};
							var tagKey = Comments.getResourceKey(forResource);
							tagObj[tagKey] = resourceId;
							comment = {};
							comment.now=now;
							comment.text = commentVal;
							comment.user = 'test';
							comment.userId = $scope.userId;
							angular.extend(comment,tagObj);
							var commentObj = new Comments(comment);
							console.log("newly added comment ="+comment.text);
							console.log("comment obj...");
							console.log(comment);
							$scope.comments.push({text : comment.text, user : 'test', now : comment.now});
							var successcb = function(){ 
								console.log("saved successfully!!!");
							};
							
							var failurecb = function(){
								console.log("could not save");  
							};
							commentObj.$save(successcb, failurecb);
						}
						
						else {
							//alert("Empty Comments cannot be posted !");
							console.log("blanks not allowed");  
						}
						
						$scope.newcomment = "";	
						
					};

					Comments.forResource(
			 			forResource,
			 			resourceId,
			 			function (comments) {
							$scope.comments = comments;
						},
						function (response) {
						}
					);					
					$scope.clearComment = function(resource){
						$scope.newcomment = "";
						};
					
					
				}


			]	
		};
	}
])
