angular.module('directives.findusers', [
	'directives.userthumb',
	'directives.actionicon',
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
 				label: '@?',
				helptip: '@?',
				placeholder: '@?',
				rootDivClass: '@',
				addActionName: '@',
				addAction: '&',
				addActionFilter: '&',
				inListActionName: '@',
				inListActionFilter: '&',
				users: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'_',
				function ($scope, $element, $attrs, Users, _) {
					$scope.labelmsg = $scope.label || "Find People";
					$scope.helptipmsg = $scope.helptip || "Search for and add people" ;
					$scope.placeholderText = $scope.placeholder || "Search for people to add" ;

					$scope.users = $scope.users || [];
					$scope.usersLookup = {};
					$scope.buildLookUp = function () {
						angular.forEach($scope.users, function(value, key) {
							$scope.usersLookup[value.$id()] = value;
						});
					};

					$scope.noUsersFound = false;

					$scope.getUsers = function(query) {
						console.log("calling GETCANDIDATES BY NAME");
						$scope.noUsersFound = false;
						console.log($scope.noUsersFound);
						$scope.getUsersDebounced(query);
						// return Users.autocomplete(
						// if( angular.isDefined(query) ){
					};

					$scope.getUsersDebounced = _.debounce(
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
				}
			]
			// link: function(scope, element, attrs) {
			// 	scope.labelmsg = scope.labelmsg || "Find People";
			// 	scope.helptipmsg = scope.helptipmsg || "Search for and add people" ;
			// 	scope.placeholderText = scope.placeholderText || "Search for people to add" ;

			// 	// scope.actionDisabled = scope.actionDisabled || false;
			// 	// scope.action = scope.action || function () {/*a dummy action*/};

			// 	// scope.date = scope.date || new Date();
			// 	// scope.opened = false;

			// 	// scope.setValidationClasses = function () {
			// 	// 	return {
			// 	// 		'has-success' : scope.ngform.dateField.$valid,
			// 	// 		'has-error' : scope.ngform.dateField.$invalid
			// 	// 	};
			// 	// }

			// 	// console.log("PRINTING THE FORM OBJECT from the isolated scope");
			// 	// console.log(ngform);
			// }
		};
	}
])
