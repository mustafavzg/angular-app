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
				},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Comments',
				'security',
				'$q',

				function ($scope, $element, $attrs,Comments,security,$q) {
					$scope.fetchingComments = true;
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
							tagObj = {};
							var tagKey = Comments.getResourceKey(forResource);
							tagObj[tagKey] = resourceId;
							comment = {};
							comment.timeStampDate = new Date(new Date().setMinutes(new Date().getMinutes()-new Date().getTimezoneOffset()));
							var firstPartOfUrl = window.location.pathname.match(/\/projects\/.*\//);
							if (commentVal.indexOf("#") != -1 ) 
									{
										for (var i=0; i<commentVal.length;i++)
										{
											if(commentVal[i] === "#" && commentVal[i-1] != ">")
											{
												
												switch(commentVal.charAt(i+1))
												{
													case 'T' : {
														var regex = /(^|\s)#T([^\s]+)/;
														var match = regex.exec(commentVal);
														comment.taskId = match[2];
														console.log("\n taskId..");
														console.log(comment.taskId);
														commentVal=commentVal.replace(/(^|\s)#T([^\s]+)/g,' <a href=\"'+firstPartOfUrl+'tasks\/'+"$2"+'\">#T$2</a>');
														break;
													}
													case 'B' : {
														var regex = /(^|\s)#B([^\s]+)/;
														var match = regex.exec(commentVal);
														comment.backlogItemId = match[2];
														console.log("\n backlogItemId..");
														console.log(comment.backlogItemId);
														commentVal=commentVal.replace(/(^|\s)#B([^\s]+)/g,' <a href=\"'+firstPartOfUrl+'productbacklog\/'+"$2"+'\">#B$2</a>');
														break;
													}
													case 'S' : {
														var regex = /(^|\s)#S([^\s]+)/;
														var match = regex.exec(commentVal);
														comment.sprintId = match[2];
														console.log("\n sprintId..");
														console.log(comment.sprintId);
														commentVal=commentVal.replace(/(^|\s)#S([^\s]+)/g,' <a href=\"'+firstPartOfUrl+'sprints\/'+"$2"+'\">#S$2</a>');
														break;
													}
													case 'P' : {
														var regex = /(^|\s)#P([^\s]+)/;
														var match = regex.exec(commentVal);
														comment.projectId = match[2];
														console.log("\n projectId..");
														console.log(comment.projectId);
														commentVal=commentVal.replace(/(^|\s)#P([^\s]+)/g,' <a href=\"\/projects\/'+"$2"+'\">#P$2</a>');
														break;
													}

												}
											}
										}
																	
									}
								
							if (commentVal.indexOf("@") != -1 ) 
									{
										for (var i=0; i<commentVal.length;i++)
										{
											if(commentVal[i] === "@" && commentVal[i-1] != ">")
											{
												var regex = /(^|\s)@([^\s]+)/;
												var match = regex.exec(commentVal);
												user = match[2];
												console.log("\n User..");
												console.log(user);
												commentVal=commentVal.replace(/(^|\s)@([^\s]+)/g,' <a href=\"'+firstPartOfUrl+'users\/'+"$2"+'\">@$2</a>');
											}
										}
									}
							comment.text = commentVal;
							comment.createdBy = ($scope.currentUser)? $scope.currentUser.Username : "janusha";
							comment.hiveUserProfileId = ($scope.currentUser)? $scope.currentUser.ID : "23";
							angular.extend(comment,tagObj);
							console.log("Comments Obj");
							console.log(comment);
							console.log("now query..");
							var commentObj = new Comments(comment);
							console.log("now");
							console.log(now);
							$scope.comments.push({text : comment.text,  createdBy: comment.createdBy, timeStampDate: now});
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
			 				$scope.fetchingComments = false;
							console.log("comments fetched");
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
]);
