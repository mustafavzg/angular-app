angular.module('directives.users', [
	'services.directiveInitializer',
	'services.dictionary',
	'directives.userthumb',
	'directives.helptip',
	'directives.actionicon',
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
				labelIcon: '@?',
				labelClickAction: '&?',
				fetchingUsers: '=?',
				// Using initOptions one can setup some of the
				// above attributes
				// direct attributes will override the initOptions attributes
				initOptions: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'directiveInitializer',
				'dictionary',
				'_',
				function ($scope, $element, $attrs, Users, directiveInitializer, dictionary, _) {

					$scope.initOptions = $scope.initOptions || {};
 					$scope.self = {};
					var attrsData = {
						initOptions: $scope.initOptions,
						attrs: $attrs,
						interpolationKeys: [
							'rootDivClass',
							'collectionName',
							'label',
							'labelIcon',
							'helptip',
							'actionName',
							'actionIcon',
							'actionButtonClass',
							'actionHidden',
							'actionDisabled'
						],
						expressionKeys: [
							'action',
							'roleFunction',
							'labelClickAction'
						],
						attrDefaults: {
							// rootDivClass: 'inline-block',
							// roleFunction: "getUserRoles(user)",
							// action: "viewUser(user)",
							// labelClickAction: "manageUsers()",
							// // labelClickAction: function () {
							// // 	console.log("this is the default click action");
							// // },
							// actionName: "Inbox",
							// actionIcon: "inbox",
							// // actionButtonClass: "btn-info",
							// actionButtonClass: "btn-success",
							// helptip: "Edit"
						}
					};

					// setup the directive model based on interpolation and expression attributes
					directiveInitializer.init($scope, $scope.self, attrsData, true);
					// directiveInitializer.init($scope, $attrs, $scope.self, $scope.initOptions, interpolationKeys, expressionKeys, attrDefaults, true);

					console.log("ATTRIBUTES ARE");
					console.log($attrs);

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

					// $scope.usersDictionary = dictionary;
					$scope.usersDictionary = dictionary('users');

					$scope.lookUpUsersInParent = function (usersIdList) {
						if( angular.isDefined($scope.usersLookUp) ){
							return $scope.usersLookUp({userids: usersIdList});
						}
						return [];
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
							$scope.usersDictionary.build(newUsers)
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
									$scope.usersDictionary.build(users);
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
						var usersInLocal = $scope.usersDictionary.lookUpList(usersIdList) || [];

						console.log("users in local");
						console.log(usersInLocal);
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

							$scope.usersDictionary.build(usersInParent);
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
								console.log("seems like usersIDS model changed");
								var removeIds = _.difference(oldUserIds, newUserIds);
								var addIds = _.difference(newUserIds, oldUserIds);
								console.log(newUserIds);
								console.log(oldUserIds);
								console.log("add ids");
								console.log(addIds);
								console.log("remove ids");
								console.log(removeIds);

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
