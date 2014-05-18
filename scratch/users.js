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
				helptip: '@',
				action: '&',
				actionName: '@',
				actionIcon: '@',
				actionButtonClass: '@',
				users: '=?',
				userIds: '=?',
				usersFunc: '&'
				// actionFilter: '&',
				// inListActionName: '@',
				// inListActionFilter: '&'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'Users',
				'_',
				function ($scope, $element, $attrs, Users, _) {
					$scope.labelmsg = $scope.label || "Team";
					$scope.helptipmsg = $scope.helptip || "Build your team" ;

					$scope.actionDisabled = $scope.actionDisabled || false;
					$scope.action = $scope.action || function () {/*a dummy action*/};

					// $scope.getUsers = function () {
					// 	if( angular.isDefined($scope.userIds)
					// 	 && angular.isArray($scope.userIds)
					// 	 && $scope.userIds.length > 0 ){
					// 		$scope.fetchingUsers = true;
					// 		Users.getByIds(
					// 			$scope.userIds,
					// 			function (users) {
					// 				$scope.users = users;
					// 				$scope.fetchingUsers = false;
					// 			},
					// 			function (response) {
					// 				console.log("Failed to fetch users");
					// 				console.log(response);
					// 			}
					// 		);
					// 		// return Users.getByIds($scope.userIds).then(
					// 		// 	function (users) {
					// 		// 		console.log($scope.users);
					// 		// 		console.log($scope.usersIds);
					// 		// 		$scope.fetchingUsers = false;
					// 		// 		return users;
					// 		// 	},
					// 		// 	function (response) {
					// 		// 		console.log("Failed to fetch users");
					// 		// 		console.log(response);
					// 		// 		$scope.fetchingUsers = false;
					// 		// 	}
					// 		// );
					// 	}
					// 	return false;
					// };

					// $scope.users = $scope.users || $scope.getUsers() || [];
					$scope.users = $scope.users || [];
					$scope.lookUpUsersInParent = function (usersIdList) {
						if( angular.isDefined($scope.usersFunc) ){
							return $scope.usersFunc({userids: usersIdList})
						}
						return [];
					};

					// build a local dictionary
					$scope.usersDictionary = {};
					$scope.buildLookUp = function (users) {
						angular.forEach(users, function(value, key) {
							$scope.usersDictionary[value.$id()] = value;
						});
					};

					$scope.lookUpUsersInLocal = function (usersIdList) {
						// return _.map(usersIdList, function (userId) {
						// 		   return $scope.usersDictionary[userId] || false;
						// 	   });

						var users = [];

						// for(var i = -1; ++i < usersIdList.length;){
						// 	var user = $scope.usersDictionary[usersIdList[i]];
						// 	if( angular.isDefined(user) ){
						// 		users.push(user);
						// 	}
						// }

						users = _.map(usersIdList, function (userId) {
								   return $scope.usersDictionary[userId];
							   });

						users = _.filter(users, function (user) {
								   return angular.isDefined(user);
							   });

						return users;

					};


					$scope.fetchUsersByIds = function (usersIdList) {

						$scope.fetchingUsers = true;
						var users = $scope.lookUpUsers(usersIdList) || [];
						$scope.users = users;
						var usersIdsNotInLookUp = _.difference(
							usersIdList,
							_.map(
								users,
								function (user) {
									return user.$id();
								}
							)
						);

						if( usersIdsNotInLookUp.length > 0 ){
							Users.getByIds(
								// addIds,
								usersIdsNotInLookUp,
								function (users) {
									$scope.fetchingUsers = false;
									$scope.buildLookUp(users);
									// $scope.users = $scope.lookUpUsersInLocal(newUserIds);
									// $scope.users = $scope.lookUpUsers(newUserIds);
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
							console.log("users in parent");
							console.log(usersInParent);

							$scope.buildLookUp(usersInParent);
							users = users.concat(usersInParent);
							// var usersIdsNotInParent = _.difference(
							// 	usersIdsNotInLocal,
							// 	_.map(
							// 		usersInParent,
							// 		function (user) {
							// 			return user.$id();
							// 		}
							// 	)
							// );
						}
						console.log("all users");
						console.log(users);
						return users;

						// var userslocal = _.map(
						// 	usersIdList,
						// 	function (userId) {
						// 		return $scope.usersDictionary[userId];
						// 	}
						// );
						// return _.map(usersIdList, function (userId) {
						// 		   return $scope.usersDictionary[userId];
						// 	   });

						// var usersIdsNotFound = [];
						// for(var i = -1; ++i < usersIdList.length;){
						// 	var user = $scope.usersDictionary[usersIdList[i]];
						// 	if( angular.isDefined(user) ){
						// 		users.push(user);
						// 	}
						// 	else {
						// 		usersIdsNotFound.push(usersIdList[i]);
						// 	}
						// }

					};


					if( angular.isDefined($scope.userIds)
					 && angular.isArray($scope.userIds)
					 && $scope.userIds.length > 0 ){

						// // fetch the initial users
						// $scope.fetchingUsers = true;
						// var initUsers = $scope.usersFunc({userids: $scope.userIds}) || [];
						// if( initUsers.length > 0 ){
						// 	$scope.buildLookUp(initUsers);
						// 	// $scope.users = $scope.lookUpUsersInLocal($scope.userIds);
						// 	$scope.users = initUsers;
						// 	$scope.fetchingUsers = false;
						// }
						// else {
						// 	Users.getByIds(
						// 		$scope.userIds,
						// 		function (users) {
						// 			$scope.fetchingUsers = false;
						// 			$scope.buildLookUp(users);
						// 			$scope.users = users;
						// 		},
						// 		function (response) {
						// 			console.log("Failed to fetch users");
						// 			console.log(response);
						// 		}
						// 	);
						// }

						$scope.fetchUsersByIds($scope.userIds);

						// $scope.fetchingUsers = true;
						// var users = $scope.lookUpUsers($scope.userIds) || [];
						// $scope.users = users;
						// var usersIdsNotInLookUp = _.difference(
						// 	$scope.userIds,
						// 	_.map(
						// 		users,
						// 		function (user) {
						// 			return user.$id();
						// 		}
						// 	)
						// );

						// if( usersIdsNotInLookUp.length > 0 ){
						// 	Users.getByIds(
						// 		// addIds,
						// 		usersIdsNotInLookUp,
						// 		function (users) {
						// 			$scope.fetchingUsers = false;
						// 			$scope.buildLookUp(users);
						// 			// $scope.users = $scope.lookUpUsersInLocal(newUserIds);
						// 			// $scope.users = $scope.lookUpUsers(newUserIds);
						// 			$scope.users = $scope.users.concat(users);
						// 		},
						// 		function (response) {
						// 			console.log("Failed to fetch added users users");
						// 			console.log(response);
						// 		}
						// 	);
						// }
						// else {
						// 	$scope.fetchingUsers = false;
						// }

						// register a watch expression
					}

					// $scope.getUsers();

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

								// $scope.fetchingUsers = true;
								// // var addUsers = $scope.usersFunc({userids: addIds}) || [];

								// var users = $scope.lookUpUsers(newUserIds) || [];
								// $scope.users = users;
								// var usersIdsNotInLookUp = _.difference(
								// 	newUserIds,
								// 	_.map(
								// 		users,
								// 		function (user) {
								// 			return user.$id();
								// 		}
								// 	)
								// );

								// if( usersIdsNotInLookUp.length > 0 ){
								// 	Users.getByIds(
								// 		// addIds,
								// 		usersIdsNotInLookUp,
								// 		function (users) {
								// 			$scope.fetchingUsers = false;
								// 			$scope.buildLookUp(users);
								// 			// $scope.users = $scope.lookUpUsersInLocal(newUserIds);
								// 			// $scope.users = $scope.lookUpUsers(newUserIds);
								// 			$scope.users = $scope.users.concat(users);
								// 		},
								// 		function (response) {
								// 			console.log("Failed to fetch added users users");
								// 			console.log(response);
								// 		}
								// 	);
								// }
								// else {
								// 	$scope.fetchingUsers = false;
								// }

								// var addUsers = $scope.lookUpUsers(addIds) || [];
								// var usersIdsNotInLookUp = _.difference(
								// 	addIds,
								// 	_.map(
								// 		addUsers,
								// 		function (user) {
								// 			return user.$id();
								// 		}
								// 	)
								// );

								// if( addUsers.length > 0 ){
								// 	$scope.buildLookUp(addUsers);
								// 	$scope.users = $scope.lookUpUsersInLocal(newUserIds)
								// 	$scope.fetchingUsers = false;
								// }
								// else {
								// }


							}
							else {
								// $scope.users = $scope.lookUpUsersInLocal(newUserIds);
								$scope.users = $scope.lookUpUsers(newUserIds);
							}
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
