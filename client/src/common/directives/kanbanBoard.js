angular.module('directives.kanbanBoard', [
	'directives.actionicon',
	'ui.bootstrap',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'directives.kanbanCard',
	'underscore',
	'moment',
	'resources.tasks'
])

// Kanban board directive
.directive('kanbanBoard', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/kanbanBoard.tpl.html',
			replace: true,
			scope: {
  				resourceconf: '=?',
				items: '=',
				users: '=',
				fetchingitems: '=?',
				widgetTitle: '@?',
				modal: '@?',
				modalOpen: '&?',
				itemStatusColor: '&?',
				rootDivClass: '@?',
				reloadKanbanFn: '&?'
				// itemToRowDataSource: '&?',
				// itemToTaskDataSource: '&?',
				// itemLookUp: '&?',
				// updateValidator: '&?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'dateFilter',
				'resourceDictionary',
				'crudEditHandlers',
				'i18nNotifications',
				'_',
				'moment',
				'$timeout',
				'Tasks',
				'$q',
				'$filter',
				function (
					$scope,
					$element,
					$attrs,
					dateFilter,
					resourceDictionary,
					crudEditHandlers,
					i18nNotifications,
					_,
					moment,
					$timeout,
					Tasks,
					$q,
					$filter
				) {
					console.log("title is "+$scope.title);
					console.log("items are "+$scope.items);
					/**************************************************
					 * Settings
					 **************************************************/

					/**************************************************
					 * Data model
					 **************************************************/
					var conf = $scope.resourceconf;
					// $scope.currentPage = conf.pagination.currentPage;
					// $scope.itemsPerPage = conf.pagination.itemsPerPage;

					if( conf ){
						$scope.itemsCrudHelpers = conf.resource.itemsCrudHelpers;
						$scope.resourceKey = conf.resource.key;
						$scope.rootDivClass = conf.resource.rootDivClass;
						$scope.manageResources = conf.resource.link;
						$scope.resourcePrettyName = conf.resource.prettyName;
						$scope.resourcePrettyNameAlt = conf.resource.altPrettyName;
					}

					$scope.itemCrudNotificationHelpers = angular.extend({}, crudEditHandlers($scope.resourceKey));;

					$scope.minDate = new Date();
					$scope.maxDate = new Date();

					$scope.data = [];

					$scope.usersIndexedByUsername = {};
					$scope.usersIndexedById = {};

					var itemDictionary = resourceDictionary($scope.resourceKey);
					var lookUpItem = function (itemId) {
						if( angular.isDefined($attrs['itemLookUp']) ){
							return $scope.itemLookUp({itemId: itemId});
						}
						else {
							return itemDictionary.lookUpItem(itemId);
						}
					};

					var truncateString = function (str, length) {
						var shortString = str;
						if( str && str.length > length && length >= 3){
							shortString = str.substr(0, length - 3);
							shortString = shortString.trim();
							shortString = shortString + '...'
						}
						return shortString;
					};

					/**************************************************
					 * Item url callback
					 **************************************************/
					$scope.viewItem = function (item) {
						return $scope.itemsCrudHelpers.view(item.$id(), 1);
					};

					/**************************************************
					 * Priority generator
					 **************************************************/
					var getRandomInt = function (min, max) {
						return Math.floor(Math.random() * (max - min)) + min;
					};

					$scope.randomPriority = function () {
						return getRandomInt(1,5);
					};

					$scope.setRandomPriority = function (item) {
						item.priority = $scope.randomPriority();
						// angular.forEach(items, function(item) {
						// 	item.priority = $scope.randomPriority();
						// });
					};

					/**************************************************
					 * Get the kanban chart data from the list of items
					 **************************************************/
					// var getKanbanData = function (items) {
					// 	var data = [];
					// 	angular.forEach(items, function(item) {
					// 		data.push(getKanbanDataForItem(item));
					// 	});
					// 	return data;
					// };

					var getKanbanData = function (items) {
						var groupedItems = _.chain(items)
							// .each(
							// 	function (item) {
							// 		item.kanbanClass = "kanban_" + item.getStatusDef().key.toLowerCase();
							// 	}
							// )
						    // Set random priority
							.each(
								function (item) {
									$scope.setRandomPriority(item);
								}
							)
							.groupBy(
								function (item) {
									return item.getStatusDef().key;
								}
							)
							.value();

						return groupedItems;
					};

					$scope.reloadKanbanData = function () {
						console.log("reloading kanban data");
						// $scope.kanbanData = [];
						$scope.kanbanData = getKanbanData($scope.items);
					};

					$scope.reloadKanbanFn({fn: $scope.reloadKanbanData});

					$scope.sortedStatusKeys = _.chain(Tasks.getStatusDef())
						.sortBy(function (statusDef) { return statusDef.ordering })
						.map(function (statusDef) { return statusDef.key })
						.value();


					$scope.getSortedStatusKeysWithData = function (statusKeysWithData) {
						return _.intersection($scope.sortedStatusKeys, statusKeysWithData);
					};

					console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
					console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
					console.log("sorted status keys");
					console.log($scope.sortedStatusKeys);
					// $scope.statusLeftRight =


					$scope.indexedStatusDef = _.indexBy(Tasks.getStatusDef(), 'key');
					console.log("indexed status def");
					console.log($scope.indexedStatusDef);

					// $scope.statusKeyToggles = {};
					// // $scope.statusKeyToggles = _.chain($scope.sortedStatusKeys)
					// _.each($scope.sortedStatusKeys, function (statusKey) {
					// 	$scope.statusKeyToggles[statusKey] = {
					// 		leftIsOpen: false,
					// 		rightIsOpen: false
					// 	};
					// });

					// $scope.toggleLeft = function (statusKey) {
					// 	$scope.statusKeyToggles[statusKey].rightIsOpen = false;
					// 	$scope.statusKeyToggles[statusKey].leftIsOpen = !$scope.statusKeyToggles[statusKey].leftIsOpen
					// };

					// $scope.toggleRight = function (statusKey) {
					// 	$scope.statusKeyToggles[statusKey].leftIsOpen = false;
					// 	$scope.statusKeyToggles[statusKey].rightIsOpen = !$scope.statusKeyToggles[statusKey].rightIsOpen
					// };

					// if in a modal dialogue set kanbanData right away
					// else set the watch expressions
					if( $scope.modal ){
						$scope.usersIndexedByUsername = _.indexBy($scope.users, 'username');
						$scope.usersIndexedById = _.indexBy(
							$scope.users,
							function (user) {
								return user.$id();
							}
						);
						console.log("indexed users are:");
						console.log($scope.usersIndexedByUsername);

						$scope.kanbanData = getKanbanData($scope.items);
						console.log("MUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMUMU");
						console.log("MODAL - kanban directive data is");
						console.log($scope.kanbanData);
						if( !angular.isDefined($attrs['itemLookUp']) ){
							itemDictionary.setItems($scope.items);
						}
					}
					else {
						$scope.$watchCollection('items', function (newItems, oldItems) {
							if( !angular.equals(newItems, oldItems) ){
								$scope.kanbanData = getKanbanData(newItems);
								// $scope.sortedStatusKeysWithData = $scope.getSortedStatusKeysWithData(_.keys($scope.kanbanData));
								// console.log("sorted keys with data");
								// console.log($scope.sortedStatusKeysWithData);

								console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
								console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
								console.log("kanban directive data is");
								console.log($scope.kanbanData);
								if( !angular.isDefined($attrs['itemLookUp']) ){
									itemDictionary.setItems(newItems);
								}
							}
						});

						$scope.$watchCollection('users', function (newItems, oldItems) {
							if( !angular.equals(newItems, oldItems) ){
								$scope.usersIndexedByUsername = _.indexBy($scope.users, 'username');
								$scope.usersIndexedById = _.indexBy(
									$scope.users,
									function (user) {
										return user.$id();
									}
								);
								console.log("indexed users are:");
								console.log($scope.usersIndexedByUsername);
							}
						});
					}

					$scope.clearData = function () {
						$scope.kanbanData = {};
					};

					$scope.getUsername =  function (item) {
						return (item.assignedUserId)? $scope.usersIndexedById[item.assignedUserId].username : null;
					};

					$scope.getStatusColor =  function (item) {
						return item.getStatusDef().color;
					};

					$scope.getAllStatuses = function () {
						return $scope.sortedStatusKeys;
					};

					$scope.getOtherStatus = _.memoize(
						function (statusKey, sortedStatusKeys, next) {
							var currentIndex = sortedStatusKeys.indexOf(statusKey);
							if( next ){
								return sortedStatusKeys.slice(currentIndex + 1);
							}
							return sortedStatusKeys.slice(0, currentIndex);
						},
						function (statusKey, sortedStatusKeys, next) {
							return statusKey + '_' + sortedStatusKeys.join("::") + '_' + next;
						}
					);

					$scope.getPrevStatus = function (statusKey) {
						return $scope.getOtherStatus(statusKey, $scope.sortedStatusKeys);
					};

					$scope.getNextStatus = function (statusKey) {
						return $scope.getOtherStatus(statusKey, $scope.sortedStatusKeys, 1);
					};

					$scope.getUsers = function (exceptUser) {
						return ( !exceptUser )? $scope.users : _.reject(
							$scope.users,
							function (user) { return user.username === exceptUser; }
						);
					};

					$scope.moveItem = function (itemId, fromStatus, toStatus) {
						if( toStatus ){
							var item = lookUpItem(itemId);
							item.status = toStatus;
							var itemIndex = $scope.kanbanData[fromStatus].indexOf(item);
							var itemRemoved = $scope.kanbanData[fromStatus].splice(itemIndex, 1)[0];
							if( !$scope.kanbanData[toStatus] ){
								$scope.kanbanData[toStatus] = [];
							}
							$scope.kanbanData[toStatus].push(itemRemoved);
						}
					};

					$scope.reassignItem = function (itemId, fromUsername, toUsername) {
						if( toUsername ){
							var item = lookUpItem(itemId);
							item.assignedUserId = $scope.usersIndexedByUsername[toUsername].$id();
						}
					};

					$scope.notifyChange = function (itemIds, resourcePrettyName, error) {
						var notification;
						if( error ){
							notification = {
								key: 'crud.kanban.save.error',
								type: 'error',
								context: {
									resources: $scope.resourcePrettyName,
									resourceids: itemIds,
									error: error
								}
							};
						}
						else {
							notification = {
								key: 'crud.kanban.save.success',
								type: 'success',
								context: {
									resources: $scope.resourcePrettyName,
									resourceids: itemIds
								}
							};
						}
						i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					}

					$scope.updateItem = function (item, updates) {
						// >>>
						// return the promise object
						// update the item

						var fromUsername = $scope.usersIndexedById[item.assignedUserId] || null;
						var fromStatus = item.status || null;
						var toStatus, toUsername;

						var updateFields = {};
						if( updates.status ){
							updateFields.status = toStatus = updates.status;
						}
						if( updates.username ){
							updateFields.assignedUserId = $scope.usersIndexedByUsername[updates.username].$id();
							toUsername = updates.username;
						}
						return item.$updateFields(
							updateFields,
							function (response) {
								console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
								console.log("kanban update done");
								console.log(updateFields);
								console.log(response);

								$scope.reassignItem(item.$id(), fromUsername, toUsername);
								$scope.moveItem(item.$id(), fromStatus, toStatus);

								$scope.notifyChange([item.$id()], $scope.resourcePrettyName);
								// $scope.sortedStatusKeysWithData = $scope.getSortedStatusKeysWithData(_.keys($scope.kanbanData));
								// console.log("sorted keys with data");
								// console.log($scope.sortedStatusKeysWithData);

								// // reassign item
								// if( toUsername ){
								// 	$scope.reassignItem(item.$id(), fromUsername, toUsername);
								// }

								// // move the item from the current statuskey list to the next statuskey list
								// if( toStatus ){
								// 	$scope.moveItem(item.$id(), fromStatus, toStatus);
								// }
							},
							function (error) {
								console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
								$scope.notifyChange([item.$id()], $scope.resourcePrettyName, error);
								// var notification = $scope.itemCrudNotificationHelpers.onUpdateError(error);
								// i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
								// itemBursts.pop();
								console.log("Kanban Failed to update:");
								console.log(updateFields);
								return $q.reject("Kanban Failed to update: " + error);
								// fail
								// notify user
								// return $q.reject
							}
						);
					};

					$scope.clearPinBoard = function () {
						$scope.pinBoard = [];
					};

					$scope.updatePinBoardItems = function () {
						var updates = {};
						if( $scope.moveToStatus ){
							updates.status = $scope.moveToStatus;
						}
						if( $scope.assignToUser ){
							updates.assignedUserId = $scope.usersIndexedByUsername[$scope.assignToUser].$id();
						}
						console.log("multiple item updates are:");
						console.log(updates);

						if( updates.status ||  updates.assignedUserId ){
							// move the subsequent code here

							// determine from and to status/usersname for each item
							var itemUpdates = {};
							angular.forEach($scope.pinBoard, function(itemPinned) {
								var itemId = itemPinned.$id();
								itemUpdates[itemId] = {username: {}, status: {}};
								// var fromUsername = $scope.usersIndexedById[item.assignedUserId] || null;
								itemUpdates[itemId]['username']['from'] = $scope.usersIndexedById[itemPinned.assignedUserId] || null;
								itemUpdates[itemId]['username']['to'] = $scope.assignToUser || null;
								itemUpdates[itemId]['status']['from'] = itemPinned.status || null;
								itemUpdates[itemId]['status']['to'] = $scope.moveToStatus || null;
							});

							$scope.updateItems($scope.pinBoard, updates).then(
								function (response) {
									// update the kanban board
									angular.forEach(itemUpdates, function(itemUpdate, itemId) {
										// reassign item
										$scope.reassignItem(itemId, itemUpdate['username']['from'], itemUpdate['username']['to']);
										// if( itemUpdate['username']['to'] ){
										// 	$scope.reassignItem(itemId, itemUpdate['username']['from'], itemUpdate['username']['to']);
										// }

										// move the item from the current statuskey list to the next statuskey list
										$scope.moveItem(itemId, itemUpdate['status']['from'], itemUpdate['status']['to']);
										// if( itemUpdate['status']['to'] ){
										// 	$scope.moveItem(itemId, itemUpdate['status']['from'], itemUpdate['status']['to']);
										// }

										// $scope.sortedStatusKeysWithData = $scope.getSortedStatusKeysWithData(_.keys($scope.kanbanData));
										// console.log("sorted keys with data");
										// console.log($scope.sortedStatusKeysWithData);

										$scope.pinBoard = [];
										// notification
									});

									// notify success
									$scope.notifyChange(_.keys(itemUpdates), $scope.resourcePrettyName);
									// var notification = {
									// 	key: 'crud.kanban.save.success',
									// 	type: 'success',
									// 	context: {
									// 		resources: $scope.resourcePrettyName,
									// 		resourceids: _.keys(itemUpdates)
									// 	}
									// };
									// i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
								},
								function (error) {
									// notify error
									$scope.notifyChange(_.keys(itemUpdates), $scope.resourcePrettyName, error);

									// var notification = {
									// 	key: 'crud.kanban.save.error',
									// 	type: 'success',
									// 	context: {
									// 		resources: $scope.resourcePrettyName,
									// 		resourceids: _.keys(itemUpdates)
									// 	}
									// };
									// i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
								}
							);
						}
					};

					$scope.updateItems = function (items, updateFields) {
						// var updateFields = {};
						// if( $scope.moveToStatus ){
						// 	updateFields.status = $scope.moveToStatus;
						// }
						// if( $scope.assignToUser ){
						// 	updateFields.assignedUserId = $scope.usersIndexedByUsername[$scope.assignToUser].$id();
						// }
						// console.log("multiple item updates are:");
						// console.log(updateFields);

						// determine from and to status/usersname for each item
						// var itemUpdates = {};
						// angular.forEach(items, function(item) {
						// 	itemUpdates[item.$id()] = {username: {}, statu: {}};
						// 	// var fromUsername = $scope.usersIndexedById[item.assignedUserId] || null;
						// 	itemUpdates[item.$id()]['username']['from'] = $scope.usersIndexedById[item.assignedUserId] || null;
						// 	itemUpdates[item.$id()]['username']['to'] = $scope.assignToUser || null;
						// 	itemUpdates[item.$id()]['status']['from'] = item.status || null;
						// 	itemUpdates[item.$id()]['status']['to'] = $scope.moveToStatus || null;
						// });

						return Tasks.updateMultipleItems(
							items,
							updateFields,
							function (response) {
								console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
								console.log("pinboard updates done");
								console.log(updateFields);
								console.log(response);

								// angular.forEach(itemUpdates, function(itemUpdate, itemId) {
								// 	// reassign item
								// 	$scope.reassignItem(itemId, itemUpdate['username']['from'], itemUpdate['username']['to']);
								// 	// if( itemUpdate['username']['to'] ){
								// 	// 	$scope.reassignItem(itemId, itemUpdate['username']['from'], itemUpdate['username']['to']);
								// 	// }

								// 	// move the item from the current statuskey list to the next statuskey list
								// 	$scope.moveItem(itemId, itemUpdate['status']['from'], itemUpdate['status']['to']);
								// 	// if( itemUpdate['status']['to'] ){
								// 	// 	$scope.moveItem(itemId, itemUpdate['status']['from'], itemUpdate['status']['to']);
								// 	// }
								// });
							},
							function (error) {
								console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
								// var notification = $scope.itemCrudNotificationHelpers.onUpdateError(error);
								// i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);

								// itemBursts.pop();
								console.log("Pinboard update failed:");
								console.log(updateFields);
								return $q.reject("Pinboard update failed: " + error);
								// fail
								// notify user
								// return $q.reject
							}
						);
					};

					$scope.pinBoardHasItems = function () {
						return $scope.pinBoard.length;
					};

					$scope.pinBoard = [];
					$scope.isPinned = {}; // the data model to unpin items from outside
					$scope.pinItem = function (item, off, inPinBoard) {
						// the item passed could be a clone
						// so do a fresh lookup
						item = lookUpItem(item.$id());
						console.log("the off swithc");
						console.log(off);
						if( off ){
							var unPinIndex = $scope.pinBoard.indexOf(item);
							$scope.pinBoard.splice(unPinIndex, 1);
							console.log("un pin index is : " + unPinIndex);
							console.log("unpinned pin board");
							console.log($scope.pinBoard);

							// $scope.isPinned[item.$id()] = false;

							// if( inPinBoard ){
							// 	// send message to kanban children
							// 	// to unpin themselves
							// 	// var unpinEvent = "unpin::" + item.$id();
							// 	// console.log("broadcasting " + "unpin::" + item.$id());
							// 	// $scope.$broadcast("unpin::" + item.$id());
							// }
						}
						else {
							$scope.pinBoard.push(item);
							// $scope.isPinned[item.$id()] = true;
						}
						console.log("pin board is");
						console.log($scope.pinBoard);
						console.log($scope.isPinned);
					};

					$scope.itemIsPinned = function (item) {
						item = lookUpItem(item.$id());
						return ($scope.pinBoard.indexOf(item) >= 0)? true : false;
					};

					$scope.showError = function (ngFormController, error) {
						// return scope.ngform.dateField.$error[error];
						return ngFormController.$error[error];
					};

					$scope.setValidationClasses = function (ngFormController) {
						return {
							'has-success' : ngFormController.$valid,
							'has-error' : ngFormController.$invalid
						};
					};

					$scope.setWarningClasses = function (ngFormController) {
						return {
							'text-danger' : ngFormController.$invalid
						};
					};

					/**************************************************
					 * Filters
					 **************************************************/
					$scope.filteredKanbanData = {};

					$scope.isFilteredData = function () {
						return ($scope.taskNameFilter || $scope.usernameFilter || $scope.priorityRangeFilterText)? true : false;
					};

					// dispatcher only for sortByFilters that do not represent a
					// direct attribute on the object
					$scope.sortByDispatch = {
						id: function (item) {
							return item.$id();
						},
						username: function (item) {
							if( !item.assignedUserId ){
								// unassigned items should appear first
								return 'a';
							}
							return $scope.usersIndexedById[item.assignedUserId].username;
						}
					};

					$scope.sortItemsBy = function (item) {
						var fn = $scope.sortByDispatch[$scope.sortByFilter] || function (item) { return item[$scope.sortByFilter]; };
						return fn(item);
					}

					$scope.sortByFilterReverse = false;
					$scope.toggleReverseSort = function () {
						$scope.sortByFilterReverse = !$scope.sortByFilterReverse;
					};

					$scope.filterByUsername = function (item) {
						if( !$scope.usernameFilter ){
							return 1;
						}
						// if( !$scope.usernameFilter || $scope.usernameFilter === "*" ){
						// 	return 1;
						// }
						else {
							if( !item.assignedUserId ){
								return 0;
							}
							return ($scope.usersIndexedById[item.assignedUserId].username === $scope.usernameFilter);
						}
					};

					$scope.clearUsernameFilter = function () {
						$scope.usernameFilter = null;
					};

					$scope.getPriorityRangeFilter = _.memoize(
						function (rangeText) {
							if( rangeText ){
								var range = _.chain(rangeText.split("-"))
											.map(function (numStr) { return parseInt(numStr, 10); })
											.reject(function (num) { return !num;  })
											.value();
								console.log("range is: " + range);
								if( range.length === 1){
									return function (item) {
										return (item.priority === range[0])? 1 : 0;
									};
								}
								if( range.length === 2){
									return function (item) {
										return (item.priority >= range[0] && item.priority <= range[1])? 1 : 0;
									};
								}
							};
							return function () { return 1; };
						}
					);

					$scope.priorityRangeFilter = function (item) {
						return $scope.getPriorityRangeFilter($scope.priorityRangeFilterText)(item);
					};

					// $scope.getPriorityRangeFilter = function (rangeText) {
					// 	if( rangeText ){
					// 		var range = _.chain(rangeText.split("-"))
					// 					.map(function (numStr) { return parseInt(numStr, 10); })
					// 					.reject(function (num) { return !num;  })
					// 					.value();
					// 		console.log("range is: " + range);
					// 		if( range.length === 2){
					// 			return function (item) {
					// 				return (item.priority >= range[0] && item.priority <= range[1])? 1 : 0;
					// 			};
					// 		}
					// 	};
					// 	return function () { return 1; };
					// };

					// $scope.getPriorityRangeFilter2 = _.memoize(
					// 	function (range) {
					// 		if( range ){
					// 			if( range.length === 1){
					// 				return function (item) {
					// 					return (item.priority === range[0])? 1 : 0;
					// 				};
					// 			}
					// 			if( range.length === 2){
					// 				return function (item) {
					// 					return (item.priority >= range[0] && item.priority <= range[1])? 1 : 0;
					// 				};
					// 			}
					// 		}
					// 		return function () { return 1; };
					// 	},
					// 	function (range) {
					// 		return (range) ? range.join("-") : range;
					// 		// return range.join("-")
					// 	}
					// );

					// $scope.setPriorityRange = _.throttle(
					// 	function (rangeText) {
					// 		$scope.priorityRange = _.chain(rangeText.split("-"))
					// 							   .map(function (numStr) { return parseInt(numStr, 10); })
					// 							   .reject(function (num) { return !num;  })
					// 							   .value();

					// 		console.log("new range is ");
					// 		console.log($scope.priorityRange);
					// 	},
					// 	1000
					// );

					// $scope.setPriorityRange = function (rangeText) {
					// 	$scope.priorityRange = _.chain(rangeText.split("-"))
					// 						   .map(function (numStr) { return parseInt(numStr, 10); })
					// 						   .reject(function (num) { return !num;  })
					// 						   .value();

					// 	console.log("new range is ");
					// 	console.log($scope.priorityRange);
					// };

					// $scope.priorityRange = [];
					// $scope.$watch('priorityRangeFilterText', function (newRangeText, oldRangeText) {
					// 	// for scalars (for objects use watchcollection)
					// 	if( newRangeText !== oldRangeText ){
					// 		$scope.setPriorityRange(newRangeText);
					// 	}
					// });

					// $scope.priorityRangeFilter2 = function (item) {
					// 	return $scope.getPriorityRangeFilter2($scope.priorityRange)(item);
					// };

					/**************************************************
					 * Combined filter
					 * username filter
					 * priority range filter
					 * taskname filter
					 **************************************************/
					$scope.itemFilter = function (item) {
						var filterOk = true;
						if( $scope.usernameFilter ){
							filterOk = $scope.filterByUsername(item) && filterOk;
							if( !filterOk ){
								return filterOk
							}
						}
						if( $scope.priorityRangeFilterText ){
							filterOk = $scope.priorityRangeFilter(item) && filterOk;
							if( !filterOk ){
								return filterOk
							}
						}
						return filterOk;
					};

					// console.log("NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN");
					// console.log($scope.getPrevStatus('CODECHECK'));
					// console.log($scope.getNextStatus('CODECHECK'));

					// $scope.statusNextPrev = (function (statusKeys) {
					// 	var statusNextPrev = {}
					// 	_.chain(statusKeys)
					// 	.each(function (statusKey) {
					// 		var current = statusKeys.indexOf(statusKey);
					// 		statusNextPrev[statusKey]['prev'] = statusKeys
					// 	})

					// }($scope.sortedStatusKeys));

					// $scope.initData = function () {
					// 	// $scope.loadData(getSampleData().data1);
					// 	$scope.loadData(getGanttData($scope.items));
					// 	// TODO: This does not work, need to fix this
					// 	// $scope.setDateRange($scope.scale, true);
					// };

					// $scope.reloadData = function () {
					// 	// $scope.loadData(getSampleData().data1);
					// 	$scope.loadData(getGanttData($scope.items));
					// };

				}
			]
			// link: function(scope, element, attrs) {
			// 	console.log("LINKING THE GANTTCHART!!!!");
			// }
		};
	}
]);
