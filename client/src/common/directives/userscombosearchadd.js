angular.module('directives.userscombosearchadd', [
	'directives.users',
	'directives.findusers',
	'directives.userthumb',
	'directives.helptip',
	'services.dictionary',
	'services.directiveInitializer',
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
 				singleMemberList: '@',
				removeActionName: '@?',
				removeAction: '&',
				addActionName: '@?',
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
				'dictionary',
				'directiveInitializer',
				'_',
				function ($scope, $element, $attrs, Users, dictionary, directiveInitializer, _) {

					// Initializer currently used only for a couple of
					// optional attributes
					// TODO: include other attributes
 					$scope.self = {};
					var attrsData = {
						attrs: $attrs,
						interpolationKeys: [
							'addActionName',
							'removeActionName'
						],
						attrDefaults: {
							addActionName: "Add",
							removeActionName: "Remove"
						}
					};
					directiveInitializer.init($scope, $scope.self, attrsData);

					$scope.filteredUsers = [];

					// keep a users dictionary for look up of
					// searched results by the 'users' widget
					// $scope.usersDictionary = dictionary;
					$scope.usersDictionary = dictionary('users');

					$scope.lookUpUsers = function (usersIdList) {
						return $scope.usersDictionary.lookUpList(usersIdList)
					};

					$scope.addMember = function(user, list) {
						console.log("adding member");
						var userId = user.$id();

						if( $scope.singleMemberList ){
							list.pop();
							list.push(userId);
							console.log("list is");
							console.log(list);
						}
						else {
							list.push(userId);
						}
						// updateProjectListForUsers(userId, undefined, projectRole);
					};

					$scope.removeMember = function(user, list) {
						// Remove the user from the team members list
						if( $scope.singleMemberList ){
							list.pop();
						}
						else {
							var userId = user.$id();
							var idx = list.indexOf(userId);
							console.log("list is");
							console.log(list);
							if(idx >= 0) {
								list.splice(idx, 1);
							}
						}
					};

					$scope.$watchCollection('filteredUsers', function (newUsers, oldUsers) {
						if( !angular.equals(newUsers, oldUsers) ){
							$scope.usersDictionary.build(newUsers)
						}
					});

				}
			]
		};
	}
])
