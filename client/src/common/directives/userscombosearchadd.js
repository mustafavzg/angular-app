angular.module('directives.userscombosearchadd', [
	'directives.users',
	'directives.findusers',
	'directives.userthumb',
	'directives.helptip',
	'resources.users',
	'ui.bootstrap',
	'underscore'
])

// A directive that displays a user collection along with optional operations
.directive('usersComboSearchAdd', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/users-combo-search-add.tpl.html',
			replace: true,
			// require: '^form',
			scope: {
				// rootDivClass: '@',
				collectionName: '@',
				itemName: '@',
 				comboLabel: '@',
 				label: '@',
				helptip: '@',
 				searchLabel: '@',
				searchHelptip: '@',
				searchPlaceholder: '@',
				removeAction: '&',
				addAction: '&',
				addActionFilter: '&',
				inListActionFilter: '&',

				// action: '&',
				// actionName: '@',
				// actionIcon: '@',
				// actionButtonClass: '@',
				// Either users or userIds have to be defined by the directive users
				// users: '=?',
				userIds: '=?'

				// when using userIds it is recomended to define a lookup function
				// otherwise this directive will fetch the users from the server
				// and that could be a bit slow
				// usersLookUp: '&?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'_',
				function ($scope, $element, $attrs, Users, _) {
					$scope.filteredUsers = [];

					// keep a users dictionary for look up of
					// searched results by the 'users' widget
					$scope.usersDictionary = {};
					$scope.buildLookUp = function (users) {
						angular.forEach(users, function(value, key) {
							if( !angular.isDefined($scope.usersDictionary[value.$id()]) ){
								$scope.usersDictionary[value.$id()] = value;
							}
						});
					};

					$scope.lookUpUsers = function (usersIdList) {
						var users = [];
						users = _.map(usersIdList, function (userId) {
									return $scope.usersDictionary[userId];
								});
						users = _.filter(users, function (user) {
									return angular.isDefined(user);
								});
						return users;
					};

					$scope.addMember = function(user, list) {
						console.log("adding member");
						var userId = user.$id();
						list.push(userId);
						console.log($scope.project.teamMembers);
						// updateProjectListForUsers(userId, undefined, projectRole);
					};

					$scope.removeMember = function(user, list) {
						// Remove the user from the team members list
						var userId = user.$id();
						var idx = list.indexOf(userId);
						if(idx >= 0) {
							list.splice(idx, 1);
						}
						// Remove the project from the list of projects of the user
						// updateProjectListForUsers(undefined, userId, projectRole);
					};


					$scope.$watchCollection('filteredUsers', function (newUsers, oldUsers) {
						console.log("filtered users watch called");
						if( !angular.equals(newUsers, oldUsers) ){
							console.log("filtered users changed");
							$scope.buildLookUp(newUsers);
							console.log("dictionary");
							console.log($scope.usersDictionary);
						}
					});

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
