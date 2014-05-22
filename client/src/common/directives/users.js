angular.module('directives.users', [
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
			// require: '^form',
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
				// when using userIds it is recomended to define a lookup function
				// otherwise this directive will fetch the users from the server
				// and that could be a bit slow
				usersLookUp: '&?',
				roleFunction: '&?',
				fetchingUsers: '=?',

				// !!! FOR FUTURE REFERENCE : THIS WONT WORK !!!
				// since the options we are trying to override
				// are @ speced which cannot act as L-values

				// FOUND A SOLUTION FOR THIS
				// expose static parameters via scope.self

				// using options one can setup some of the
				// above attributes, direct attributes
				// will override the attributes setup in options
				initOptions: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'_',
				function ($scope, $element, $attrs, Users, _) {
					$scope.initOptions = $scope.initOptions || {};

					$scope.self = {};
					var staticOptions = [
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
					for(var i = -1; ++i < staticOptions.length;){
						var option = staticOptions[i];
						$scope.self[option] = $scope[option] || $scope.initOptions[option];
					}

					// // Initialize static attributes
					// $scope.self = {
					// 	rootDivClass: $scope.rootDivClass,
					// 	collectionName: $scope.collectionName,
					// 	label: $scope.options.label || $scope.label,
					// 	helptip: $scope.helptip
					// };

					// $scope.labelmsg = $scope.label;
					// $scope.helptipmsg = $scope.helptip;

					// $scope.options = $scope.options || {};

					console.log("options are");
					console.log($scope.initOptions);

					console.log("self options are");
					console.log($scope.self);

					// $scope.rootDivClass = $scope.rootDivClass || $scope.options.rootDivClass;
					// $scope.collectionName = $scope.collectionName || $scope.options.collectionName;
					// $scope.labelmsg = $scope.label || $scope.options.label;
					// $scope.helptipmsg = $scope.helptip || $scope.options.helptip;

					// action function should be specified as a direct attribute
					$scope.action = $scope.action || function () {/*a dummy action*/};

					// var actionOptions = $scope.options.action || {};

					// // console.log("actionOptions");
					// // console.log(actionOptions);

					// // action options could be specified in the options attribute
					// console.log("this is not happening " + actionOptions.name);
					// $scope.actionName = $scope.actionName || actionOptions.name;
					// $scope.actionIcon = $scope.actionIcon || actionOptions.icon;
					// $scope.actionButtonClass = $scope.actionButtonClass || actionOptions.buttonClass;
					// $scope.actionHidden = $scope.actionHidden || false;
					// $scope.actionDisabled = $scope.actionDisabled || $scope.actionHidden || false;

					console.log("scope options");
					console.log($scope);

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
							// console.log("userids changed");
							if( !angular.equals(newUserIds, oldUserIds) ){
								// console.log("getting the users in watch");
								var removeIds = _.difference(oldUserIds, newUserIds);
								var addIds = _.difference(newUserIds, oldUserIds);
								// console.log("add IDS: " + addIds);
								// console.log("remove IDS: " + removeIds);
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
			// link: function(scope, element, attrs) {
			// 	var actionOptions = scope.options.action || {};
			// 	console.log("actionOptions");
			// 	console.log(actionOptions);

			// 	scope.actionName = scope.actionName || actionOptions.name;
			// 	scope.actionIcon = scope.actionIcon || actionOptions.icon;

			// 	console.log("scope options");
			// 	console.log(scope);

			// }
		};
	}
])
