angular.module('directives.ganttChart', [
	'directives.actionicon',
	'ui.bootstrap',
	'filters.pagination',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'gantt',
	'underscore',
	'moment'
])

// A facade for the angular-gantt directive
.directive('ganttChart', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/ganttChart.tpl.html',
			replace: true,
			scope: {
  				resourceconf: '=',
				items: '=',
				fetchingitems: '=',
				title: '@?',
				// itemToGanttData: '&?',
				itemToRowId: '&?',
				itemToRowDataSource: '&?',
				itemToTaskDataSource: '&?',
				itemLookUp: '&?',
				updateValidator: '&?'
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
					$timeout
				) {
					console.log("title is "+$scope.title);
					/**************************************************
					 * Settings
					 **************************************************/
					$scope.mode = "date";
					$scope.setMode = function (mode) {
						$scope.mode = mode;
					};
					$scope.isActiveMode = function (mode) {
						return ($scope.mode === mode)? true : false;
					};

					$scope.scale = "month";
					$scope.setScale = function (scale) {
						$scope.scale = scale;
						$scope.setDateRange(scale, true);
					};
					$scope.isActiveScale = function (scale) {
						return ($scope.scale === scale)? true : false;
					};

					// $scope.maxHeight = 0;
					// $scope.showWeekends = true;
					// $scope.showNonWorkHours = true;
					$scope.weekendsToggleStates = [
						{
							showWeekends: true,
							toolTip: 'Hide Weekends'
						},
						{
							showWeekends: false,
							toolTip: 'Show Weekends'
						}
					];
					$scope.weekendsToggle = $scope.weekendsToggleStates[0];
					$scope.toggleWeekends = function () {
						// $scope.showWeekends = !$scope.showWeekends;
						$scope.weekendsToggle = ($scope.weekendsToggle.showWeekends)? $scope.weekendsToggleStates[1] : $scope.weekendsToggleStates[0];
					};

					$scope.workHoursToggleStates = [
						{
							showNonWorkHours: true,
							toolTip: 'Show only working hours'
						},
						{
							showNonWorkHours: false,
							toolTip: 'Show non working hours'
						}
					];
					$scope.workHoursToggle = $scope.workHoursToggleStates[0];
					$scope.toggleWorkHours = function () {
						$scope.showNonWorkHours = !$scope.showNonWorkHours;
						$scope.workHoursToggle = ($scope.workHoursToggle.showNonWorkHours)? $scope.workHoursToggleStates[1] : $scope.workHoursToggleStates[0];
					};

					$scope.heightToggleStates = [
						{
							maxHeight: 0,
							toolTip: 'Fixed Height'
						},
						{
							maxHeight: 300,
							toolTip: 'Expand Height'
						}
					];
					$scope.heightToggle = $scope.heightToggleStates[0];
					$scope.toggleHeight = function () {
						// var heights = [0, 300];
						// var toolTips = ['Fix Height', 'Expand Height'];
						// $scope.maxHeight = (!$scope.maxHeight)? heights[1] : heights[0];
						// $scope.heightToolTip = (!!$scope.maxHeight)? toolTips[1] : toolTips[0];
						$scope.heightToggle = (!$scope.heightToggle.maxHeight)? $scope.heightToggleStates[1] : $scope.heightToggleStates[0];
					};

					/**************************************************
					 * Date model
					 **************************************************/

					var conf = $scope.resourceconf;
					// $scope.currentPage = conf.pagination.currentPage;
					// $scope.itemsPerPage = conf.pagination.itemsPerPage;

					$scope.itemsCrudHelpers = conf.resource.itemsCrudHelpers;
					$scope.resourceKey = conf.resource.key;
					$scope.rootDivClass = conf.resource.rootDivClass;
					$scope.manageResources = conf.resource.link;
					$scope.resourcePrettyName = conf.resource.prettyName;
					$scope.resourcePrettyNameAlt = conf.resource.altPrettyName;
					$scope.ganttFieldMap = conf.ganttFieldMap;
					$scope.ganttFieldMap2 = conf.ganttFieldMap2;
					$scope.itemCrudNotificationHelpers = angular.extend({}, crudEditHandlers($scope.resourceKey));;

					$scope.minDate = new Date();
					$scope.maxDate = new Date();

					$scope.data = [];

					$scope.setDateRange = function (scale, reset) {
						var scaleOffsetMap = {
							hour: {
								unit: 'hours',
								value: 12
							},
							day: {
								unit: 'days',
								value: 7
							},
 							week: {
								unit: 'weeks',
								value: 1
							},
							month: {
								unit: 'months',
								value: 1
							}
						};

						console.log('min max date');
						console.log((new Date($scope.minDate)).toDateString());
						console.log((new Date($scope.maxDate)).toDateString());

						if( reset ){
							$scope.clearData();
							$scope.reloadData();
						}

						var start = moment($scope.minDate);
						var end = moment($scope.maxDate);

						// // reset the date range ?
						// $scope.fromDate = start.toDate();
						// $scope.toDate = end.toDate();

						// set the offsets
						var offset = scaleOffsetMap[scale];
						start.subtract(offset.unit, offset.value);
						end.add(offset.unit, offset.value);
						$scope.fromDate = start.toDate();
						$scope.toDate = end.toDate();
						console.log('from to date');
						console.log($scope.fromDate.toDateString());
						console.log($scope.toDate.toDateString());
					};

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
						if( str.length > length && length >= 3){
							shortString = str.substr(0, length - 3);
							shortString = shortString.trim();
							shortString = shortString + '...'
						}
						return shortString;
					};

					/**************************************************
					 * Get the gantt chart data from the list of items
					 **************************************************/
					var getGanttData = function (items) {
						var data = [];

						angular.forEach(items, function(item) {
							data.push(getGanttDataForItem(item));
						});

						// $scope.minDate =
						// angular.forEach(items, function(item) {
						// 	var itemRow = {};
						// 	var task = {};
						// 	itemRow.tasks = [task];
						// 	itemRow.id = item.$id();
						// 	task.id = item.$id();

						// 	// task.color = conf.resource.color;
						// 	// angular.forEach($scope.ganttFieldMap, function(fieldSpec) {
						// 	// 	if( angular.isDefined(fieldSpec.taskField) ){
						// 	// 		task[fieldSpec.taskField] = item[fieldSpec.key];
						// 	// 		if( fieldSpec.taskField === 'subject' ){
						// 	// 			task[fieldSpec.taskField] = truncateString(task[fieldSpec.taskField], 50);
						// 	// 		}
						// 	// 	}
						// 	// 	if( angular.isDefined(fieldSpec.rowField) ){
						// 	// 		itemRow[fieldSpec.rowField] = item[fieldSpec.key];
						// 	// 		if( fieldSpec.rowField === 'description' ){
						// 	// 			itemRow[fieldSpec.rowField] = truncateString(itemRow[fieldSpec.rowField], 50);
						// 	// 		}
						// 	// 	}
						// 	// });

						// 	task.color = $scope.ganttFieldMap.colorMap(item);

						// 	angular.forEach($scope.ganttFieldMap.task, function(fieldSpec) {
						// 		if( angular.isDefined(fieldSpec.ganttKey) ){
						// 			task[fieldSpec.ganttKey] = item[fieldSpec.key];
						// 			if( fieldSpec.ganttKey === 'subject' ){
						// 				task[fieldSpec.ganttKey] = truncateString(task[fieldSpec.ganttKey], 50);
						// 			}
						// 		}
						// 	});

						// 	angular.forEach($scope.ganttFieldMap.row, function(fieldSpec) {
						// 		if( angular.isDefined(fieldSpec.ganttKey) ){
						// 			itemRow[fieldSpec.ganttKey] = item[fieldSpec.key];
						// 			if( fieldSpec.ganttKey === 'description' ){
						// 				itemRow[fieldSpec.ganttKey] = truncateString(itemRow[fieldSpec.ganttKey], 50);
						// 			}
						// 		}
						// 	});

						// 	data.push(itemRow);
						// });
						return data;
					};

					/**************************************************
					 * Get the gantt data item based on item data
					 **************************************************/
					var getGanttDataForItem = function (item) {
						if( !angular.isDefined(item) ){
							return {};
						}

						// var itemRow = {};
						// var task = {};
						// itemRow.tasks = [task];
						// itemRow.id = item.$id();
						// task.data = { rowId: itemRow.id };
						// task.id = itemRow.id + '1';

						// task.color = $scope.ganttFieldMap.colorMap(item);

						// angular.forEach($scope.ganttFieldMap.task, function(fieldSpec) {
						// 	if( angular.isDefined(fieldSpec.ganttKey) ){
						// 		task[fieldSpec.ganttKey] = item[fieldSpec.key];
						// 		if( fieldSpec.ganttKey === 'subject' ){
						// 			task[fieldSpec.ganttKey] = truncateString(task[fieldSpec.ganttKey], 50);
						// 		}
						// 	}
						// });

						// angular.forEach($scope.ganttFieldMap.row, function(fieldSpec) {
						// 	if( angular.isDefined(fieldSpec.ganttKey) ){
						// 		itemRow[fieldSpec.ganttKey] = item[fieldSpec.key];
						// 		if( fieldSpec.ganttKey === 'description' ){
						// 			itemRow[fieldSpec.ganttKey] = truncateString(itemRow[fieldSpec.ganttKey], 50);
						// 		}
						// 	}
						// });
						// return itemRow;

						// var rowDataSource;
						// if( angular.isDefined($attrs['itemToRowDataSource']) ){
						// 	rowDataSource = $scope.itemToRowDataSource({item: item});
						// }

						var rowDataSource = $scope.itemToRowDataSource({item: item}) || item;
						var ganttRow = getGanttRowData(rowDataSource, $scope.ganttFieldMap.row, {
							rowId: $scope.itemToRowId({item: item}) || item.$id()
						});

						// ganttRow.tasks = [getGanttTaskData(item, $scope.ganttFieldMap.task, {
						// 	rowId: item.$id(),
						// 	index: 0,
						// 	colorMap: $scope.ganttFieldMap.colorMap
						// })];

						var taskDataSource = $scope.itemToTaskDataSource({item: item}) || [item];
						ganttRow.tasks = getGanttTaskData(taskDataSource, $scope.ganttFieldMap.task, {
							rowId: ganttRow.id,
							colorMap: $scope.ganttFieldMap.colorMap
						}) || [];

						return ganttRow;
					};

					var getGanttRowData = function (rowDataSource, rowConf, args) {
						var row = {};
						if( angular.isObject(args)){
							row.id = (args.rowId)? args.rowId : undefined;
						}
						angular.forEach(rowConf, function(fieldSpec) {
							if( angular.isDefined(fieldSpec.ganttKey) ){
								row[fieldSpec.ganttKey] = rowDataSource[fieldSpec.key];
								if( fieldSpec.ganttKey === 'description' ){
									row[fieldSpec.ganttKey] = truncateString(row[fieldSpec.ganttKey], 50);
								}
							}
						});
						return row;
					};

					var getGanttTaskData = function (taskDataSource, taskConf, args) {
						var tasks = [];
						// setup gantt task
						angular.forEach(taskDataSource, function(singleTaskDataSource, index) {
							var tempargs = {index: index};
							angular.extend(tempargs, args);
							tasks.push(getSingleGanttTaskData(singleTaskDataSource, taskConf, tempargs));
						});
						return tasks;
					};

					var getSingleGanttTaskData = function (singleTaskDataSource, taskConf, args) {
						var task = {};
						var tempId = [];
						if(angular.isObject(args)){
							// set rowid
							if( args.rowId ){
								task.data = { rowId: args.rowId };
								tempId.push(args.rowId);
							}

							// set taskid
							if( angular.isDefined(args.taskId) ){
								task.id = args.taskId
							}
							else if( angular.isDefined(args.index) ){
								tempId.push(args.index);
							}

							// set task color
							if( args.color ){
								task.color = args.color;
							}
							else if( angular.isFunction(args.colorMap) ) {
								task.color = args.colorMap(singleTaskDataSource);
							}
						}

						// set task.id if not already set
						if( tempId.length && !task.id ){
							task.id = tempId.join('_');
						}

						// setup gantt task
						angular.forEach(taskConf, function(fieldSpec) {
							if( angular.isDefined(fieldSpec.ganttKey) ){
								task[fieldSpec.ganttKey] = singleTaskDataSource[fieldSpec.key];
								if( fieldSpec.ganttKey === 'subject' ){
									task[fieldSpec.ganttKey] = truncateString(task[fieldSpec.ganttKey], 50);
								}
							}
						});

						if( task.from < $scope.minDate ){
							$scope.minDate = task.from
						}

						if( task.to > $scope.maxDate ){
							$scope.maxDate = task.to
						}

						if( !task.to ){
							i18nNotifications.pushForCurrentRoute('gantt.task.data.error', 'error', task);
						}

						return task;
					};

					// console.log("items are");
					// console.log(getGanttData($scope.items));

					// angular.forEach($scope.items, function(item) {
					// 	var itemRow = {};
					// 	var task = {};
					// 	itemRow.tasks = [task];
					// 	itemRow.id = item.$id();
					// 	task.id = item.$id();
					// 	angular.forEach($scope.ganttFieldMap, function(fieldSpec) {
					// 		if( angular.isDefined(fieldSpec.taskField) ){
					// 			task[fieldSpec.taskField] = item[fieldSpec.key];
					// 		}
					// 		if( angular.isDefined(fieldSpec.rowField) ){
					// 			itemRow[fieldSpec.rowField] = item[fieldSpec.key];
					// 		}
					// 	});
					// });

					/**************************************************
					 * Get the updated data for the item when a gantt
					 * task is modified
					 **************************************************/
					var getItemData = function (ganttTask) {
						var excludeGanttKeys = ['subject'];
						var updatedItemData = {};
						// updatedItemData.id = ganttTask.id;
						updatedItemData.id = ganttTask.data.rowId;
						angular.forEach($scope.ganttFieldMap.task, function(fieldSpec) {
							if( angular.isDefined(fieldSpec.ganttKey) ){
								if( !_.contains(excludeGanttKeys, fieldSpec.ganttKey) ){
									updatedItemData[fieldSpec.key] = ganttTask[fieldSpec.ganttKey];
								}
							}
						});
						return updatedItemData;
					};

					/**************************************************
					 * Validate the updates in the gantt chart
					 *
					 * Ideally we would want to do this in the directive
					 * itself, but it off to later
					 *
					 * For now we will do the validation externally
					 **************************************************/
					var itemUpdateValid = function (item, updatedItemData) {
						// var itemId = updatedItemData.id;
						// delete updatedItemData.id;
						// return {
						// 	// onError: function () {
						// 	// 	i18nNotifications.pushForCurrentRoute('crud.sprint.expired.error', 'error', {});
						// 	// }
						// };
						if( !angular.isDefined(item) ){
							return {
								onError: function () {
									var notification = $scope.itemCrudNotificationHelpers.onUpdateError("Item is not defined");
									i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
								}
							};
						}
						else if( angular.isDefined($attrs['updateValidator']) ){
							// var item = lookUpItem(itemId);
							return $scope.updateValidator({item: item, update: _.omit(updatedItemData, 'id')});
						}
						else {
							return 1;
						}
					};

					/**************************************************
					 * Update the item if the update is valid
					 * else revert the changes in the gantt chart
					 *
					 * NOTE: Currently an item corresponds to a gantt row
					 * with only one gantt task
					 *
					 * Once we implement gantt charts where each row can
					 * have multiple tasks, this implementation will change
					 * to accomodate:
					 * - look at, if this is row or item update
					 * - change implementations for getItemData, getGanttDataForItem
					 **************************************************/
					var updateOrRevertItem = function (event, updatedItemData) {
						var itemId = updatedItemData.id;
						var item = lookUpItem(itemId);
						var error = itemUpdateValid(item, updatedItemData);
						if (!angular.isObject(error)) {
							var newData = _.omit(updatedItemData, 'id');
							var oldData = _.pick(item, _.keys(newData));

							// console.log("new data");
							// console.log(newData);

							// console.log("old data");
							// console.log(oldData);

							// angular.extend(item, newData);
							item.$updateFields(
								newData,
								function (response) {
									// var notification = $scope.itemCrudNotificationHelpers.onUpdate(item);
									// i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
									// item = newItem;
									// angular.extend(item, newItem);
									// console.log("new item is ");
									// console.log(newItem);
									angular.extend(item, newData);
									$scope.loadData([getGanttDataForItem(item)]);
								},
								function (error) {
									var notification = $scope.itemCrudNotificationHelpers.onUpdateError(error);
									i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
									// revert item changes
									// angular.extend(item, oldData);
									$scope.loadData([getGanttDataForItem(item)]);
								}
							);

							// updating specific fields is a better option
							// angular.extend(item, newData);
							// // save the changes to the item
							// item.$update(
							// 	function (item) {
							// 		var notification = $scope.itemCrudNotificationHelpers.onUpdate(item);
							// 		i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
							// 	},
							// 	function (error) {
							// 		var notification = $scope.itemCrudNotificationHelpers.onUpdateError(error);
							// 		i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
							// 		// revert item changes
							// 		$scope.loadData([getGanttDataForItem(item)]);

							// 	}
							// );
						}
						else {
							// Revert the changes in the gantt chart
							// and push notification in current route
							var ganttItem = getGanttDataForItem(item);
							$scope.loadData([ganttItem]);
							if( angular.isFunction(error.onError) ){
								error.onError();
							}
							else {
								i18nNotifications.pushForCurrentRoute('gantt.row.update.error', 'error', ganttItem);
							}
						}
					};

					$scope.$watchCollection('items', function (newItems, oldItems) {
						if( !angular.equals(newItems, oldItems) ){
							console.log("items are");
							console.log(getGanttData(newItems));
							$scope.clearData();
							$scope.loadData(getGanttData(newItems));
							if( !angular.isDefined($attrs['itemLookUp']) ){
								itemDictionary.setItems(newItems);
							}
						}
					});

					$scope.initData = function () {
						// $scope.loadData(getSampleData().data1);
						$scope.loadData(getGanttData($scope.items));
						// TODO: This does not work, need to fix this
						// $scope.setDateRange($scope.scale, true);
					};

					$scope.reloadData = function () {
						// $scope.loadData(getSampleData().data1);
						$scope.loadData(getGanttData($scope.items));
					};

					$scope.removeSomeSamples = function () {
						$scope.removeData([
							{"id": "c65c2672-445d-4297-a7f2-30de241b3145"}, // Remove all Kickoff meetings
							{"id": "2f85dbeb-0845-404e-934e-218bf39750c0", "tasks": [
								{"id": "f55549b5-e449-4b0c-9f4b-8b33381f7d76"},
								{"id": "5e997eb3-4311-46b1-a1b4-7e8663ea8b0b"},
								{"id": "6fdfd775-7b22-42ec-a12c-21a64c9e7a9e"}
							]}, // Remove some Milestones
							{"id": "cfb29cd5-1737-4027-9778-bb3058fbed9c", "tasks": [
								{"id": "57638ba3-dfff-476d-ab9a-30fda1e44b50"}
							]} // Remove order basket from Sprint 2
						]);
					};

					$scope.removeSamples = function () {
						$scope.clearData();
					};

					function getSampleData() {

						return {
 							"data1": [
								// Order is optional. If not specified it will be assigned automatically
								{"id": "2f85dbeb-0845-404e-934e-218bf39750c0", "description": "Milestones", "order": 0, "tasks": [
									// Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
									{"id": "f55549b5-e449-4b0c-9f4b-8b33381f7d76", "subject": "Kickoff", "color": "#93C47D", "from": "2013-10-07T09:00:00", "to": "2013-10-07T10:00:00", "data": "Can contain any custom data or object"},
									{"id": "5e997eb3-4311-46b1-a1b4-7e8663ea8b0b", "subject": "Concept approval", "color": "#93C47D", "from": new Date(2013,9,18,18,0,0), "to": new Date(2013,9,18,18,0,0), "est": new Date(2013,9,16,7,0,0), "lct": new Date(2013,9,19,0,0,0)},
									{"id": "b6a1c25c-85ae-4991-8502-b2b5127bc47c", "subject": "Development finished", "color": "#93C47D", "from": new Date(2013,10,15,18,0,0), "to": new Date(2013,10,15,18,0,0)},
									{"id": "6fdfd775-7b22-42ec-a12c-21a64c9e7a9e", "subject": "Shop is running", "color": "#93C47D", "from": new Date(2013,10,22,12,0,0), "to": new Date(2013,10,22,12,0,0)},
									{"id": "c112ee80-82fc-49ba-b8de-f8efba41b5b4", "subject": "Go-live", "color": "#93C47D", "from": new Date(2013,10,29,16,0,0), "to": new Date(2013,10,29,16,0,0)}
								], "data": "Can contain any custom data or object"},
								{"id": "b8d10927-cf50-48bd-a056-3554decab824", "description": "Status meetings", "order": 1, "tasks": [
									{"id": "301d781f-1ef0-4c35-8398-478b641c0658", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,9,25,15,0,0), "to": new Date(2013,9,25,18,30,0)},
									{"id": "0fbf344a-cb43-4b20-8003-a789ba803ad8", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,1,15,0,0), "to": new Date(2013,10,1,18,0,0)},
									{"id": "12af138c-ba21-4159-99b9-06d61b1299a2", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,8,15,0,0), "to": new Date(2013,10,8,18,0,0)},
									{"id": "73294eca-de4c-4f35-aa9b-ae25480967ba", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,15,15,0,0), "to": new Date(2013,10,15,18,0,0)},
									{"id": "75c3dc51-09c4-44fb-ac40-2f4548d0728e", "subject": "Demo", "color": "#9FC5F8", "from": new Date(2013,10,24,9,0,0), "to": new Date(2013,10,24,10,0,0)}
								]},
								{"id": "c65c2672-445d-4297-a7f2-30de241b3145", "description": "Kickoff", "order": 2, "tasks": [
									{"id": "4e197e4d-02a4-490e-b920-4881c3ba8eb7", "subject": "Day 1", "color": "#9FC5F8", "from": new Date(2013,9,7,9,0,0), "to": new Date(2013,9,7,17,0,0)},
									{"id": "451046c0-9b17-4eaf-aee0-4e17fcfce6ae", "subject": "Day 2", "color": "#9FC5F8", "from": new Date(2013,9,8,9,0,0), "to": new Date(2013,9,8,17,0,0)},
									{"id": "fcc568c5-53b0-4046-8f19-265ebab34c0b", "subject": "Day 3", "color": "#9FC5F8", "from": new Date(2013,9,9,8,30,0), "to": new Date(2013,9,9,12,0,0)}
								]},
								{"id": "dd2e7a97-1622-4521-a807-f29960218785", "description": "Create concept", "order": 3, "tasks": [
									{"id": "9c17a6c8-ce8c-4426-8693-a0965ff0fe69", "subject": "Create concept", "color": "#F1C232", "from": new Date(2013,9,10,8,0,0), "to": new Date(2013,9,16,18,0,0), "est": new Date(2013,9,8,8,0,0), "lct": new Date(2013,9,18,20,0,0)}
								]},
								{"id": "eede0c9a-6777-4b55-9359-1eada309404e", "description": "Finalize concept", "order": 4, "tasks": [
									{"id": "30b8f544-5a45-4357-9a72-dd0181fba49f", "subject": "Finalize concept", "color": "#F1C232", "from": new Date(2013,9,17,8,0,0), "to": new Date(2013,9,18,18,0,0)}
								]},
								{"id": "b5318fd9-5d70-4eb1-9c05-65647b9aefe6", "description": "Sprint 1", "order": 5, "tasks": [
									{"id": "d1fdf100-534c-4198-afb9-7bcaef0696f0", "subject": "Product list view", "color": "#F1C232", "from": new Date(2013,9,21,8,0,0), "to": new Date(2013,9,25,15,0,0)}
								]},
								{"id": "cfb29cd5-1737-4027-9778-bb3058fbed9c", "description": "Sprint 2", "order": 6, "tasks": [
									{"id": "57638ba3-dfff-476d-ab9a-30fda1e44b50", "subject": "Order basket", "color": "#F1C232", "from": new Date(2013,9,28,8,0,0), "to": new Date(2013,10,1,15,0,0)}
								]},
								{"id": "df9bb83f-e9de-4cbe-944e-36aec6db53cc", "description": "Sprint 3", "order": 7, "tasks": [
									{"id": "192adc6e-ab17-4cd1-82d8-4a5e7525b169", "subject": "Checkout", "color": "#F1C232", "from": new Date(2013,10,4,8,0,0), "to": new Date(2013,10,8,15,0,0)}
								]},
								{"id": "48cbc052-1fd5-4262-a05f-97dad7337876", "description": "Sprint 4", "order": 8, "tasks": [
									{"id": "431dc7be-b61b-49a0-b26d-7ab5dfcadd41", "subject": "Login&Singup and admin view", "color": "#F1C232", "from": new Date(2013,10,11,8,0,0), "to": new Date(2013,10,15,15,0,0)}
								]},
								{"id": "34473cc4-5ee5-4953-8289-98779172129e", "description": "Setup server", "order": 9, "tasks": [
									{"id": "43eb6d19-6402-493c-a281-20e59a6fab6e", "subject": "HW", "color": "#F1C232", "from": new Date(2013,10,18,8,0,0), "to": new Date(2013,10,18,12,0,0)}
								]},
								{"id": "73cae585-5b2c-46b6-aeaf-8cf728c894f7", "description": "Config server", "order": 10, "tasks": [
									{"id": "8dbfda29-e775-4fa3-87c1-103b085d52ee", "subject": "SW / DNS/ Backups", "color": "#F1C232", "from": new Date(2013,10,18,12,0,0), "to": new Date(2013,10,21,18,0,0)}
								]},
								{"id": "41cae585-ad2c-46b6-aeaf-8cf728c894f7", "description": "Deployment", "order": 11, "tasks": [
									{"id": "2dbfda09-e775-4fa3-87c1-103b085d52ee", "subject": "Depl. & Final testing", "color": "#F1C232", "from": new Date(2013,10,21,8,0,0), "to": new Date(2013,10,22,12,0,0)}
								]},
								{"id": "33e1af55-52c6-4ccd-b261-1f4484ed5773", "description": "Workshop", "order": 12, "tasks": [
									{"id": "656b9240-00da-42ff-bfbd-dfe7ba393528", "subject": "On-side education", "color": "#F1C232", "from": new Date(2013,10,24,9,0,0), "to": new Date(2013,10,25,15,0,0)}
								]},
								{"id": "bffa16c6-c134-4443-8e6e-b09410c37c9f", "description": "Content", "order": 13, "tasks": [
									{"id": "2f4ec0f1-cd7a-441a-8288-e788ec112af9", "subject": "Supervise content creation", "color": "#F1C232", "from": new Date(2013,10,26,9,0,0), "to": new Date(2013,10,29,16,0,0)}
								]},
								{"id": "ec0c5e31-449f-42d0-9e81-45c66322b640", "description": "Documentation", "order": 14, "tasks": [
									{"id": "edf2cece-2d17-436f-bead-691edbc7386b", "subject": "Technical/User documentation", "color": "#F1C232", "from": new Date(2013,10,26,8,0,0), "to": new Date(2013,10,28,18,0,0)}
								]}
							]};
					}

					/**************************************************
					 * Events
					 **************************************************/

					$scope.rowEvent = function(event) {
						// A row has been added, updated or clicked. Use this event to save back the updated row e.g. after a user re-ordered it.
						console.log('Row event (by user: ' + event.userTriggered + '): ' + event.date + ' '  + event.row.description + ' (Custom data: ' + event.row.data + ')');
						console.log(event);
					};

					$scope.scrollEvent = function(event) {
						if (angular.equals(event.direction, "left")) {
							// Raised if the user scrolled to the left side of the Gantt. Use this event to load more data.
							console.log('Scroll event: Left');
						} else if (angular.equals(event.direction, "right")) {
							// Raised if the user scrolled to the right side of the Gantt. Use this event to load more data.
							console.log('Scroll event: Right');
						}
					};

					$scope.taskEvent = function(event) {
						// A task has been updated or clicked.
						console.log('Task event (by user: ' + event.userTriggered + '): ' + event.task.subject + ' (Custom data: ' + event.task.data + ')');
						console.log(event);
						var updatedItemData = getItemData(event.task);
						console.log("updated data");
						console.log(updatedItemData);
						updateOrRevertItem(event, updatedItemData);
					};

				}
			]
			// link: function(scope, element, attrs) {
			// 	console.log("LINKING THE GANTTCHART!!!!");
			// }
		};
	}
]);
