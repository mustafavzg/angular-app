angular.module('directives.users', [
	'services.modelInitializer',
	'directives.userthumb',
	'directives.helptip',
	'resources.users',
	'ui.bootstrap',
	'underscore'
])

// A directive that displays a user collection along with optional operations
.directive('users', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/users.tpl.html',
			replace: true,
			scope: {
				rootDivClass: '@',
				collectionName: '@',
 				label: '@',
				helptip: '@?',
				action: '&?',
				actionName: '@?',
				actionIcon: '@?',
				actionButtonClass: '@?',
				actionDisabled: '@?',
				actionHidden: '@?',
				// Either users or userIds have to be defined by the directive users
				users: '=?',
				userIds: '=?',
				// When using userIds it is recomended to define a lookup function
				// otherwise this directive will fetch the users from the server
				// and that could be a bit slow
				usersLookUp: '&?',
				roleFunction: '&?',
				fetchingUsers: '=?',
				// Using initOptions one can setup some of the
				// above attributes
				// initOptions attributes will override the direct attributes
				initOptions: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'modelInitializer',
				'_',
				function ($scope, $element, $attrs, Users, modelInitializer, _) {

					$scope.initOptions = $scope.initOptions || {};
					$scope.self = {};
					var interpolationKeys = [
						'rootDivClass',
						'collectionName',
						'label',
						'helptip',
						'actionName',
						'actionIcon',
						'actionButtonClass',
						'actionHidden',
						'actionDisabled'
					];
					var expressionKeys = [
						'action',
						'roleFunction'
					];
					// setup the directive model based on interpolation and expression attributes
					modelInitializer.init($scope, $scope.self, $scope.initOptions, interpolationKeys, expressionKeys);

					// console.log("options are");
					// console.log($scope.initOptions);

					// console.log("self options are");
					// console.log($scope.self);

					// action function should be specified as a direct attribute
					$scope.action = $scope.action || function () {/*a dummy action*/};

					$scope.users = $scope.users || [];

					$scope.isDefined = function (user) {
						return (angular.isDefined(user)) ? 1 : 0;
					}

					// build a local dictionary
					$scope.usersDictionary = {};
					$scope.buildLookUp = function (users) {
						angular.forEach(users, function(value, key) {
							if( !angular.isDefined($scope.usersDictionary[value.$id()]) ){
								$scope.usersDictionary[value.$id()] = value;
							}
						});
					};

					$scope.lookUpUsersInParent = function (usersIdList) {
						if( angular.isDefined($scope.usersLookUp) ){
							return $scope.usersLookUp({userids: usersIdList});
						}
						return [];
					};

					$scope.lookUpUsersInLocal = function (usersIdList) {
						var users = [];
						users = _.map(usersIdList, function (userId) {
									return $scope.usersDictionary[userId];
								});
						users = _.filter(users, function (user) {
									return angular.isDefined(user);
								});
						return users;
					};

					$scope.getUserIds = function (users) {
						return _.map(
							users,
							function (user) {
								return user.$id();
							}
						);
					};

					$scope.$watchCollection('users', function (newUsers, oldUsers) {
						console.log("seems like users model changed");
						if( !angular.equals(newUsers, oldUsers) ){
							// console.log("users model has changed");
							$scope.buildLookUp(newUsers);
							// console.log("users in directive");
							// console.log(newUsers);
						}
					});

					$scope.fetchUsersByIds = function (usersIdList) {

						$scope.fetchingUsers = true;
						var users = $scope.lookUpUsers(usersIdList) || [];
						// $scope.users = users;
						// console.log("current users");
						// console.log($scope.users);

						// No need of a union as usersIdList and users have to
						// be in sync
						// $scope.users = _.union($scope.users, users);
						$scope.users = users;

						// console.log("users after lookup");
						// console.log($scope.users);

						// console.log("users in dictionary");
						// console.log(JSON.stringify($scope.usersDictionary));

						var usersIdsNotInLookUp = _.difference(
							usersIdList,
							_.map(
								$scope.users,
								function (user) {
									return user.$id();
								}
							)
						);

						if( usersIdsNotInLookUp.length > 0 ){
							Users.getByIds(
								usersIdsNotInLookUp,
								function (users) {
									$scope.fetchingUsers = false;
									$scope.buildLookUp(users);
									$scope.users = $scope.users.concat(users);
								},
								function (response) {
									console.log("Failed to fetch users");
									console.log(response);
								}
							);
						}
						else {
							$scope.fetchingUsers = false;
						}
					};

					$scope.lookUpUsers = function (usersIdList) {
						// first check in the local lookup
						var users = [];
						var usersInLocal = $scope.lookUpUsersInLocal(usersIdList) || [];
						// console.log("users in local");
						// console.log(usersInLocal);
						users = users.concat(usersInLocal);
						var usersIdsNotInLocal = _.difference(
							usersIdList,
							_.map(
								usersInLocal,
								function (user) {
									return user.$id();
								}
							)
						);

						// else fetch from the parent look up
						if( usersIdsNotInLocal.length > 0 ){
							var usersInParent = $scope.lookUpUsersInParent(usersIdsNotInLocal) || [];
							// console.log("users in parent");
							// console.log(usersInParent);

							$scope.buildLookUp(usersInParent);
							users = users.concat(usersInParent);
						}
						// console.log("all users");
						// console.log(users);
						return users;
					};

					if( angular.isDefined($scope.userIds)
					 && angular.isArray($scope.userIds) ){
					 // && $scope.userIds.length > 0 ){
						$scope.fetchUsersByIds($scope.userIds);

						$scope.$watchCollection('userIds', function (newUserIds, oldUserIds) {
							if( !angular.equals(newUserIds, oldUserIds) ){
								var removeIds = _.difference(oldUserIds, newUserIds);
								var addIds = _.difference(newUserIds, oldUserIds);
								if( addIds.length > 0 ){
									$scope.fetchUsersByIds(newUserIds);
								}
								else {
									$scope.users = $scope.lookUpUsers(newUserIds);
								}
							}
						});
					}

				}
			]
		};
	}
])
