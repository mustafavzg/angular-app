angular.module('directives.kanbanCard', [
	'directives.icon',
	'ui.bootstrap',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'underscore',
	'moment'
])

// A kanban card thumbnail
.directive('kanbanCard', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/kanbanCard.tpl.html',
			replace: true,
			// require: '^form',
			scope: {
				item: '=',
				username: '@?',
				itemViewUrl: '&?',
				listNextStatus: '&?',
				listPrevStatus: '&?',
				listUsers: '&?',
				statusColor: '&?',
				priorityColor: '&?',
				notifyUpdates: '&?',
				updateUser: '&?',
				pinMe: '&?',
				// isPinned: '@?',
				isPinned: '&?',
				inPinBoard: '@?'

				// action: '&?',
				// roleFunction: '&?',
				// actionName: '@?',
				// actionIcon: '@?',
				// actionButtonClass: '@?',
				// actionDisabled: '@?',
				// actionHidden: '@?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'_',

				// 'dateFilter',
				// 'resourceDictionary',
				// 'crudEditHandlers',
				// 'i18nNotifications',
				// 'moment',
				// '$timeout',

				function (
					$scope,
					$element,
					$attrs,
					_

					// dateFilter,
					// resourceDictionary,
					// crudEditHandlers,
					// i18nNotifications,
					// moment,
					// $timeout
				) {
					// $scope.statusKeyToggles = {};
					// // $scope.statusKeyToggles = _.chain($scope.sortedStatusKeys)
					// _.each($scope.sortedStatusKeys, function (statusKey) {
					// 	$scope.statusKeyToggles[statusKey] = {
					// 		leftIsOpen: false,
					// 		rightIsOpen: false
					// 	};
					// });

					$scope.statusToggles = {
						leftIsOpen: false,
						reassignIsOpen: false,
						rightIsOpen: false
					};

					$scope.closeOthers = function (exceptKey) {
						_.chain($scope.statusToggles).keys().each(function (key) {
							if( key !== exceptKey ){
								$scope.statusToggles[key] = false;
							}
						});
					};

					$scope.noneOpen = function () {
						return _.every($scope.statusToggles, function (isOpen, key) {
							return !isOpen;
						});
					};

					$scope.anyOpen = function () {
						return _.some($scope.statusToggles, function (isOpen, key) {
							return isOpen;
						});
					};

					$scope.toggleLeft = function () {
						// $scope.statusToggles.rightIsOpen = false;
						$scope.closeOthers('leftIsOpen');
						$scope.statusToggles.leftIsOpen = !$scope.statusToggles.leftIsOpen;
					};

					$scope.toggleRight = function () {
						// $scope.statusToggles.leftIsOpen = false;
						$scope.closeOthers('rightIsOpen');
						$scope.statusToggles.rightIsOpen = !$scope.statusToggles.rightIsOpen;
					};

					$scope.toggleReassign = function () {
						// $scope.statusToggles.leftIsOpen = false;
						$scope.closeOthers('reassignIsOpen');
						$scope.statusToggles.reassignIsOpen = !$scope.statusToggles.reassignIsOpen;
					};

					$scope.clearFields = function () {
						$scope.moveToStatus = "";
						$scope.assignToUser = "";
					}

					$scope.nextStatusList = function () {
						return $scope.listNextStatus({statusKey: $scope.item.status});
					};

					$scope.prevStatusList = function () {
						return $scope.listPrevStatus({statusKey: $scope.item.status});
					};

					$scope.usersReassignList = function () {
						return $scope.listUsers({exceptUsername: $scope.username});
					};

					$scope.usersList = function () {
						return $scope.listUsers();
					};

					// set the selects to required
					// enable the notify button only if the form is valid
					// call this only if the form is valid
					// take in the form controller

					$scope._notifyUpdates = function (action) {
						var onActionToggles = {
							'right': $scope.toggleRight,
							'left': $scope.toggleLeft,
							'reassign': $scope.toggleReassign
						};
						var updates = {};
						updates.status = $scope.moveToStatus || null;
						updates.username = $scope.assignToUser || null;
						// return updates;
						// >>>
						// return the promise object
						console.log("updates are :");
						console.log(updates);
						$scope.notifyUpdates({item: $scope.item, updates: updates}).then(
							function (response) {
								// success, do nothing
								// notification ??
								onActionToggles[action]();
								$scope.clearFields();
							},
							function (error) {
								// fail, clear the selects
								// notification ??
							}
						);
					};

					// $scope.unpinEvent = "unpin::" + $scope.item.$id();
					// $scope.$on("unpin::" + $scope.item.$id(), function (event) {
					// 	console.log("received: " + "unpin::" + $scope.item.$id());
					// 	if( $scope.item.$id() === event.name.split("::")[1]){
					// 		$scope.pinToggle();
					// 	}
					// });

					$scope._isPinned = function () {
						return $scope.isPinned({item: $scope.item});
					}

					// $scope.isPinned = $scope.isPinned || false;
					$scope.pinToggle = function () {
						// if( $scope.isPinned ){
						if( $scope._isPinned() ){
							// if( $scope.inPinBoard ){
							// 	// unpin from the pinboard
							// 	// notify parent
							// }
							console.log("un pinning");
							$scope.pinMe({item: $scope.item, off: true, inPinBoard: $scope.inPinBoard});
						}
						else {
							console.log("pinning");
							$scope.pinMe({item: $scope.item, off: false});
						}
						// $scope.isPinned = !$scope.isPinned;
						// console.log("item is pinned: " + $scope.isPinned);
						console.log("item is pinned: " + $scope._isPinned());
					};

					// console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
					// console.log($scope.prevStatusList());
					// console.log($scope.nextStatusList());

					// $scope.getStatusColor =  function (item) {
					// 	return $scope.statusColor({item: $scope.item});
					// };

					$scope.showError = function (ngFormController, error) {
						// return scope.ngform.dateField.$error[error];
						return ngFormController.$error[error];
					}

					$scope.setValidationClasses = function (ngFormController) {
						return {
							'has-success' : ngFormController.$valid,
							'has-error' : ngFormController.$invalid
						};
					}

					$scope.setWarningClasses = function (ngFormController) {
						return {
							'text-danger' : ngFormController.$invalid
						};
					}
				}
			],

			// link: function (scope, element, attrs, kanbanBoardCtrl ) {
			link: function (scope, element, attrs) {
				var statusColor = scope.statusColor({item: scope.item});
				// console.log("cccccccccccccccccccccccccccccccccccccccccccccccccc");
				// console.log(statusColor);
				if( statusColor ){
					element.find("#caption").css('background-color', statusColor);
				}

				var priorityColor = scope.priorityColor({item: scope.item});
				// console.log("cccccccccccccccccccccccccccccccccccccccccccccccccc");
				// console.log(priorityColor);
				if( priorityColor ){
					element.find("#header").css('background-color', priorityColor);
				}

			}
		};
	}
])
