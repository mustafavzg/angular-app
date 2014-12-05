angular.module('directives.kanbanBoardWithModal', [
	'directives.actionicon',
	'ui.bootstrap',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'directives.kanbanBoard',
	'underscore',
	'moment',
	'resources.tasks'
])

// Kanban board directive
.directive('kanbanBoardWithModal', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/kanbanBoardWithModal.tpl.html',
			replace: true,
			scope: {
				resourceconf: '=?',
				items: '=',
				users: '=',
				fetchingitems: '=?',
				itemsCrudHelpers: '=?',
				widgetTitle: '@?',
				rootDivClass: '@?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'$log',
				'resourceDictionary',
				'crudEditHandlers',
				'i18nNotifications',
				'_',
				'moment',
				'$timeout',
				'Tasks',
				'$q',
				'$modal',
				function (
					$scope,
					$element,
					$attrs,
					$log,
					resourceDictionary,
					crudEditHandlers,
					i18nNotifications,
					_,
					moment,
					$timeout,
					Tasks,
					$q,
					$modal
				) {
					console.log("title is "+$scope.title);
					console.log("items are "+$scope.items);

					/**************************************************
					 * Data model
					 **************************************************/
					var itemDictionary = resourceDictionary($scope.resourceKey);
					var lookUpItem = function (itemId) {
						if( angular.isDefined($attrs['itemLookUp']) ){
							return $scope.itemLookUp({itemId: itemId});
						}
						else {
							return itemDictionary.lookUpItem(itemId);
						}
					};

					$scope.modalOpening = false;
					$scope.kanbanOpen = function (size) {
 						$scope.modalOpening = true;
						var modalInstance = $modal.open({
							templateUrl: 'directives/kanbanBoardModal.tpl.html',
 							controller: 'KanbanBoardModalCtrl',
							// scope: $scope,
							size: size,
							resolve: {
								// items: function () {
								// 	return $scope.items;
								// },
								items: function () {
									return $scope.items;
								},
								users: function () {
									return $scope.users;
								},
								crudHelpers : function  () {
									return $scope.itemsCrudHelpers;
								}
								// kanbanData: function () {
								// 	return getKanbanData($scope.tasks);
								// }
							}
						});

						modalInstance.opened.then(
							function () {
								// opening a modal seems like a blocking call
								// and other watch expressions are not evaluated
								// until the modal is opened
								console.log("modal is opened");
								$scope.modalOpening = false;
							}
						);

						modalInstance.result.then(
							function (items) {
								console.log("items returned from modal");
								console.log(items);
								$scope.items = items;
								$scope.reloadMainKanban();

								// $log.info('Modal Item selected: ' + selectedItem + ' at ' + new Date());
								// $scope.selected = selectedItem;
							},
							function () {
								$log.info('Modal dismissed at: ' + new Date());
							}
						);

						// modalInstance.opened.then(
						// 	function () {
						// 		spinnerModalInstance.close();
						// 	}
						// );

						// var spinnerModalInstance = $modal.open({
						// 	template: '<div class="modal-body">Loading Data ... <img src="/static/img/spinner.gif"></div>',
 						// 	// controller: 'KanbanBoardModalCtrl',
						// 	// scope: $scope,
						// 	size: 'sm'
						// });

					};

					// $scope.kanbanModalDone = function () {
					// 	// $close does not seem to be defined
					// 	// not using this approach for now
					// 	$scope.$close($scope.items);
					// };
				}
			]
			// link: function(scope, element, attrs) {
			// 	console.log("LINKING THE GANTTCHART!!!!");
			// }
		};
	}
])

.controller('KanbanBoardModalCtrl', [
	'$scope',
	'$modalInstance',
	'$interpolate',
	'crudHelpers',
	'Tasks',
	'items',
	'users',
	'_',
	function (
		$scope,
		$modalInstance,
		$interpolate,
		crudHelpers,
		Tasks,
		items,
		users,
		_
	) {
		$scope.items = items;
		$scope.users = users;
		$scope.crudHelpers = crudHelpers;

		$scope.itemsKanbanConf = {
			resource : {
				key : 'tasks',
				prettyName : 'Tasks',
				altPrettyName : 'Tasks',
				rootDivClass : 'panel-body',
				itemsCrudHelpers : $scope.crudHelpers
			}
		};

		$scope.done = function () {
			// $modalInstance.close($scope.selected.item);
			$modalInstance.close($scope.items);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
]);

;
