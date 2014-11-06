angular.module('directives.comment', [
	'ngSanitize',
	'ui.bootstrap',
	'directives.icon',
	'resources.comment',
	'resources.projects',
	'resources.users',
	'projectsitemview',
	'productbacklog',
	'sprints',
	'tasksnew',
	'users'
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
				date: '='
				//userId: '@'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Comments',
				'security',
				'$q',

				function ($scope, $element, $attrs,Comments,security,$q) {
					if(!$scope.comments)
					{
						$scope.comments = [];
					}

 					$q.when(security.requestCurrentUser()).then(
						function (currentUser) {
					 		$scope.currentUser = currentUser;
			 			}
					);

					var resourceId = $scope.resourceId;
					var forResource = $scope.forResource;
					$scope.addComment = function(commentVal){
						if(commentVal){
							var now = new Date();
							var date = now.getDate();
							var period="AM";
							var year= now.getFullYear();
							var hour= now.getHours();
							var minutes= now.getMinutes();
							if (hour > 12) {
 								hour -= 12;
 								period="PM";
							} else if (hour === 0) {
   								hour = 12;
   								period="AM";
							}
							else if(hour == 12 && minutes >= 0)
							{

							 	period ="PM";
							}

							var seconds= now.getSeconds();
							var time= hour+"."+minutes+"."+seconds+"."+now.getMilliseconds()+" "+period;
							var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
							var month= months[now.getMonth()];
							tagObj = {};
							var tagKey = Comments.getResourceKey(forResource);
							tagObj[tagKey] = resourceId;
							comment = {};
							comment.timeStamp =date+"-"+month+"-"+year+" "+time;
							comment.text = commentVal;
							comment.createdBy = ($scope.currentUser)? $scope.currentUser.Username : "";
							comment.hiveUserProfileId = ($scope.currentUser)? $scope.currentUser.ID : "";;
							angular.extend(comment,tagObj);
							console.log("Comments Obj");
							console.log(comment);

							var commentObj = new Comments(comment);
							$scope.comments.push({text : comment.text,  createdBy: comment.createdBy, timeStamp: comment.timeStamp});
							var successcb = function(){
								console.log("saved successfully!!!");
							};

							var failurecb = function(){
								console.log("could not save");
							};
							commentObj.$save(successcb, failurecb);
						}

						else {
							console.log("blanks not allowed");
						}
						$scope.newcomment = "";
					};

					Comments.forResource(
			 			forResource,
			 			resourceId,
			 			function (comments) {
							$scope.comments = comments;
							console.log("comments fetchec");
							console.log($scope.comments);
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