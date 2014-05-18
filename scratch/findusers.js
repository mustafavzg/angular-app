angular.module('directives.findusers', [
	'directives.userthumb',
	'resources.users',
	'ui.bootstrap',
	'underscore'
])

// A user thumbnail with various options
.directive('findusers', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/findusers.tpl.html',
			replace: true,
			// require: '^form',
			scope: {
				rootDivClass: '@',
				// user: '=',
				project: '=',
				addActionName: '@',
				addAction: '&',
				addActionFilter: '&',
				inListActionName: '@',
				inListActionFilter: '&'
				// actionName: '@',
				// actionIcon: '@',
				// actionButtonClass: '@',
				// actionDisabled: '@?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'_',
				function ($scope, $element, $attrs, Users, _) {

					// This does not work for some reason
					// $scope.labelmsg = $scope.labelmsg || "Find People";
					// $scope.helptipmsg = $scope.helptipmsg || "Search for and add people" ;
					// $scope.placeholderText = $scope.placeholderText || "Search for people to add" ;

					// assigning to different scope values works
					$scope.labelmsg = $scope.label || "Find People";
					$scope.helptipmsg = $scope.helptip || "Search for and add people" ;
					$scope.placeholderText = $scope.placeholder || "Search for people to add" ;

					$scope.users = [];
					$scope.usersLookup = {};
					$scope.buildLookUp = function () {
						angular.forEach($scope.users, function(value, key) {
							$scope.usersLookup[value.$id()] = value;
						});
					};

					$scope.getUsers = function (usersIdList) {
						return _.map(usersIdList, function (userId) {
								   return $scope.usersLookup[userId];
							   });
					};

					// $scope.teamMemberAutocomplete = [];
					$scope.noUsersFound = false;

					$scope.getCandidatesByName = function(query) {
						console.log("calling GETCANDIDATES BY NAME");
						$scope.noUsersFound = false;
						console.log($scope.noUsersFound);
						$scope.getCandidatesByNameDeb(query);
						// return Users.autocomplete(
						// if( angular.isDefined(query) ){
					};

					$scope.getCandidatesByNameDeb = _.debounce(
						function(query) {
							console.log("calling GETCANDIDATES BY NAME DEBOUNcED");
							// $scope.noUsersFound = false;
							// console.log($scope.noUsersFound);
							// return Users.autocomplete(
							// if( angular.isDefined(query) ){
							if( query !== "" ){
								console.log("fetching user for GETCANDIDATES BY NAME for query: '" + query + "'");
								$scope.loadingUsers = true;
								Users.autocomplete(
									query,
									function (users) {
										console.log("Succeeded to fetch users for typeahead");
										// $scope.teamMemberAutocomplete = users;
										$scope.users = users;
										$scope.buildLookUp();
										// return users;
										$scope.loadingUsers = false;
										if( !users.length ){
											$scope.noUsersFound = true;
										}
									},
									function (response) {
										console.log("Failed to fetch users for typeahead");
										$scope.loadingUsers = false;
									}
								);
							}
						},
						500
					);

					$scope.candidates = function(users) {
						return users.filter(
							function(user) {
								return $scope.addActionFilter({user: user});
								// return $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
							}
						);
					};

					$scope.members = function(users) {
						return users.filter(
							function(user) {
								return $scope.inListActionFilter({user: user});
								// return $scope.project.isDevTeamMember(user.$id());
							}
						);
					};

					// var updateProjectListForUsers = function (newUserId, prevUserId, projectList) {

					// 	// Add the project to the users list of projects
					// 	if( angular.isDefined(newUserId) ){
					// 		var user = $scope.usersLookup[newUserId];
					// 		if( !angular.isArray(user[projectList]) ){
					// 			user[projectList] = [];
					// 		}
					// 		user[projectList].push($scope.project.$id());
					// 		console.log("added project to the " + projectList);
					// 		console.log(user[projectList]);
					// 	}

					// 	// Remove the project from the users list of projects
					// 	if( angular.isDefined(prevUserId) ){
					// 		var user = $scope.usersLookup[prevUserId];
					// 		if( angular.isArray(user[projectList]) ){
					// 			var projectidx = user[projectList].indexOf($scope.project.$id());
					// 			if(projectidx >= 0) {
					// 				user[projectList].splice(projectidx, 1);
					// 			}
					// 			console.log("removed project from the "+ projectList);
					// 			console.log(user[projectList]);
					// 		}
					// 	}
					// };

					// $scope.addTeamMember = function(user) {
					// 	if($scope.selTeamMember) {
					// 		// add the user as team member
					// 		$scope.project.teamMembers.push($scope.selTeamMember);

					// 		// add the project to the users list of projects
					// 		updateProjectListForUsers($scope.selTeamMember, undefined, 'teamMemberOfProjects');

					// 		// clear the selected value
					// 		$scope.selTeamMember = undefined;
					// 	}
					// 	console.log("adding team member");
					// 	// $scope.selTeamMember = userid;
					// 	$scope.project.teamMembers.push(user.$id());
					// 	console.log($scope.project.teamMembers);
					// 	updateProjectListForUsers(user.$id(), undefined, 'teamMemberOfProjects');
					// };

					// $scope.removeTeamMember = function(teamMember) {
					// 	// remove the user from the team members list
					// 	var idx = $scope.project.teamMembers.indexOf(teamMember.$id());
					// 	if(idx >= 0) {
					// 		$scope.project.teamMembers.splice(idx, 1);
					// 	}

					// 	// Remove the project from the list of projects of the user
					// 	updateProjectListForUsers(undefined, teamMember.$id(), 'teamMemberOfProjects');

					// 	// If we have removed the team member that is currently selected
					// 	// then clear this object
					// 	if($scope.selTeamMember === teamMember.$id()) {
					// 		$scope.selTeamMember = undefined;
					// 	}
					// };
				}
			],
			link: function(scope, element, attrs) {
				// scope.actionDisabled = scope.actionDisabled || false;
				// scope.action = scope.action || function () {/*a dummy action*/};

				// scope.date = scope.date || new Date();
				// scope.opened = false;

				// scope.setValidationClasses = function () {
				// 	return {
				// 		'has-success' : scope.ngform.dateField.$valid,
				// 		'has-error' : scope.ngform.dateField.$invalid
				// 	};
				// }

				// console.log("PRINTING THE FORM OBJECT from the isolated scope");
				// console.log(ngform);
			}
		};
	}
])
