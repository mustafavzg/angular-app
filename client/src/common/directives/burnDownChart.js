angular.module('directives.burnDownChart', [
	'directives.actionicon',
	'ui.bootstrap',
	'filters.pagination',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'services.directiveInitializer',
	'services.statusLog',
	'ui.chart',
	'filters.groupBy',
	'filters.groupByFlat',
	'filters.flattenGroupBy',
	'underscore',
	'moment'
])

// A burn down chart directive
.directive('burnDownChart', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/burnDownChart.tpl.html',
			replace: true,
			scope: {
				items: '=',
				fetchingitems: '=',
  				// resourceConfig: '=',
  				chartConfig: '=',
				rootDivClass: '@?',
				// itemToColor: '&?',
				// itemLookUp: '&?',
				randomData: '@?'
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
				'groupByFilter',
				'groupByFlatFilter',
				'flattenGroupByFilter',
				'directiveInitializer',
				'statusLog',
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
					groupByFilter,
					groupByFlatFilter,
					flattenGroupByFilter,
					directiveInitializer,
					statusLog
				) {

					// var resourceConfig = $scope.resourceConfig;
					// $scope.resourcePrettyName = resourceConfig.resource.prettyName;
					// $scope.resourcePrettyNameAlt = resourceConfig.resource.altPrettyName;

					// set some defaults for the directive's attributes
 					$scope.self = {};
					var attrsData = {
						attrs: $attrs,
						interpolationKeys: [
							'rootDivClass'
						],
						// expressionKeys: [
						// 	'itemToColor',
						// 	'itemLookUp'
						// ],
						attrDefaults: {
							rootDivClass: 'panel-body'
						}
					};
					directiveInitializer.init($scope, $scope.self, attrsData);

					/**************************************************
					 * Chart Config ADT
					 **************************************************/
					var burnDownChartConfig = function (config) {
						angular.extend(this, config);
						this.groupByDictionary = resourceDictionary(
							'groupBy',
							function (value) {
								return value.key;
							}
						);
						this.groupByDictionary.setItems(config.groupBy);

						this.summaryItemsDictionary = resourceDictionary(
							'summaryItems',
							function (value) {
								return value.key;
							}
						);
						this.summaryItemsDictionary.setItems(config.summary);
					};

					burnDownChartConfig.lookUpSpec = function (specKey, specDictionary) {
						return specDictionary.lookUpItem(specKey);
					};

					burnDownChartConfig.prototype.lookUpGroupBySpec = function (specKey) {
						return burnDownChartConfig.lookUpSpec(specKey, this.groupByDictionary);
					};

					burnDownChartConfig.prototype.lookUpSummarySpec = function (specKey) {
						if( specKey === "count" ){
							return {
								prettyName: "Number",
								prettyNameSuffix: "of"
							};
						}
						else {
							return burnDownChartConfig.lookUpSpec(specKey, this.summaryItemsDictionary);
						}
					};

					// Enable/Disable attributes
					burnDownChartConfig.toggleAttr = function (attrSpec) {
						attrSpec.disabled = !attrSpec.disabled;
					};

					burnDownChartConfig.isDisabledAttr = function (attrSpec) {
						return attrSpec.disabled || false;
					};

					// Fetch attributes specs or specific keys in the attribute specs
					burnDownChartConfig.getAttributes = function (attrSpecs, options, attrKey) {
						var that = this;
						if( _.isObject(options) ){
							if( _.isArray(options.customOrder) ){
								// Note: for custom order, pass in the
								// corresponding the dictionary for lookup
								attrSpecs = _.map(options.customOrder, function (key) {
									return options.dictionary.lookUpItem(key);
								});
							}
							else if( !_.isUndefined(options.orderingKey) ){
								attrSpecs = _.sortBy(attrSpecs, function (attrSpec) {
									return attrSpec[options.orderingKey];
								});
							}
						}

						if( !options.allowDisabled ){
							attrSpecs = _.filter(
								attrSpecs,
								function (attrSpec) {
									return !burnDownChartConfig.isDisabledAttr(attrSpec);
								}
							);
						}

						// if( !_.isUndefined(attrKey) ){
						if( attrKey ){
							return _.map(
								attrSpecs,
								function (attrSpec) {
									return attrSpec[attrKey];
								}
							);
						}
						else {
							return attrSpecs;
						}
					};

					burnDownChartConfig.getAttributeKeys = function (attrSpecs, options) {
						// return burnDownChartConfig.getAttributes(attrSpecs, 'key', 'ordering');
						// return burnDownChartConfig.getAttributes(attrSpecs, 'key', options);
						return burnDownChartConfig.getAttributes(attrSpecs, options, 'key');
					};

					burnDownChartConfig.getAttributeDisplayNames = function (attrSpecs, options) {
						// return burnDownChartConfig.getAttributes(attrSpecs, 'prettyName', 'ordering');
						// return burnDownChartConfig.getAttributes(attrSpecs, 'prettyName', options);
						return burnDownChartConfig.getAttributes(attrSpecs, options, 'prettyName');
					};

					/**************************************************
					 * group by attributes
					 **************************************************/
					// attribute specs
					burnDownChartConfig.prototype.getGroupByAttributeSpecs = function (options) {
						// return burnDownChartConfig.getAttributes(this.groupBy);
						var that = this;
						return burnDownChartConfig.getAttributes(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));

						// if( _.isArray(customOrder) ){
						// 	return burnDownChartConfig.getAttributes(that.groupBy, {
						// 		customOrder: customOrder,
						// 		// customOrder: ['type', 'status'],
						// 		// customOrder: ['status', 'type'],
						// 		dictionary: that.groupByDictionary
						// 	});
						// }
						// else {
						// 	return burnDownChartConfig.getAttributes(that.groupBy, {
						// 		orderingKey: 'ordering'
						// 	});
						// }
					};

					// attribute keys
					burnDownChartConfig.prototype.getGroupByAttributes = function (options) {
						var that = this;
						return burnDownChartConfig.getAttributeKeys(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));
					};

					// attribute pretty names
					burnDownChartConfig.prototype.getGroupByAttributesPretty = function (options) {
						// return burnDownChartConfig.getAttributeDisplayNames(this.groupBy);
						var that = this;
						return burnDownChartConfig.getAttributeDisplayNames(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));
					};

					/**************************************************
					 * Summary attributes
					 **************************************************/
					// attribute specs
					burnDownChartConfig.prototype.getSummaryAttributeSpecs = function (options) {
						var that = this;
						return burnDownChartConfig.getAttributes(that.summary, angular.extend({}, options, {
							dictionary: that.summaryItemsDictionary,
							orderingKey: 'ordering'
						}));
					};

					// attribute keys
					burnDownChartConfig.prototype.getSummaryAttributes = function (options) {
						// return burnDownChartConfig.getAttributeKeys(this.summary);
						var that = this;
						return burnDownChartConfig.getAttributesKeys(that.summary, angular.extend({}, options, {
							dictionary: that.summaryItemsDictionary,
							orderingKey: 'ordering'
						}));
					};

					// attribute pretty names
					burnDownChartConfig.prototype.getSummaryAttributesPretty = function (options) {
						// return burnDownChartConfig.getAttributeDisplayNames(this.summary);
						var that = this;
						return burnDownChartConfig.getAttributesDisplayNames(that.summary, angular.extend({}, options, {
							dictionary: that.summaryItemsDictionary,
							orderingKey: 'ordering'
						}));
					};

					/**************************************************
					 * Other properties
					 **************************************************/
					burnDownChartConfig.prototype.getColorMap = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return (!angular.isDefined(groupBySpec) || !angular.isDefined(groupBySpec.colorMap))? angular.noop : groupBySpec.colorMap;
					};

					burnDownChartConfig.prototype.getGroupByOrder = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return (!angular.isDefined(groupBySpec) || !angular.isDefined(groupBySpec.groupByOrder))? angular.noop : groupBySpec.groupByOrder;
					};

					/**************************************************
					 * Enable/Disable groupBy attributes
					 **************************************************/
					burnDownChartConfig.prototype.toggleGroupBy = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						burnDownChartConfig.toggleAttr(groupBySpec);
					};

					burnDownChartConfig.prototype.isDisabledGroupBy = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return burnDownChartConfig.isDisabledAttr(groupBySpec);
					};

					/**************************************************
					 * Enable/Disable summaryItem attributes
					 **************************************************/
					burnDownChartConfig.prototype.toggleSummaryItem = function (summaryItemKey) {
						var summaryItemSpec = this.summaryItemsDictionary.lookUpItem(summaryItemKey);
						burnDownChartConfig.toggleAttr(summaryItemSpec);
					};

					burnDownChartConfig.prototype.isDisabledSummaryItem = function (summaryItemKey) {
						var summaryItemSpec = this.summaryItemsDictionary.lookUpItem(summaryItemKey);
						return burnDownChartConfig.isDisabledAttr(summaryItemSpec);
					};

					/**************************************************
					 * More helpers ...
					 **************************************************/

					burnDownChartConfig.prototype.getCount = function () {
						return this.count;
					};

					// burnDownChartConfig.prototype.collapseCharts = function (setCollapse) {
					// 	if( angular.isDefined(setCollapse) ){
					// 		this.collapse = setCollapse;
					// 	}
					// 	return this.collapse;
					// };

					// burnDownChartConfig.prototype.cumulativeGroupBy = function (setCumulative) {
					// 	if( angular.isDefined(setCumulative) ){
					// 		this.cumulative = setCumulative;
					// 	}
					// 	return this.cumulative;
					// };

					burnDownChartConfig.prototype.getTitle = function () {
						return this.title;
					};

					// burnDownChartConfig.prototype.getChartTitle = function (groupByKey, summaryKey) {
					// 	var that = this;
					// 	var subTitles = [];
					// 	var summaryAttrs;
					// 	// if summary is undefined, get all the summary keys
					// 	if( _.isUndefined(summaryKey) ){
					// 		summaryAttrs = that.getSummaryAttributes();
					// 		// var summaryAttrsPretty = this.getSummaryAttributesPretty();
					// 		if( that.getCount() ){
					// 			summaryAttrs.unshift('count');
					// 			// subTitles.unshift(['Number', 'of', that.getTitle()].join(" "));
					// 		}
					// 	}
					// 	else {
					// 		summaryAttrs = [summaryKey];
					// 	}
					// 	_.each(summaryAttrs, function (summaryAttrKey, index) {
					// 		var summaryAttrSpec = that.lookUpSummarySpec(summaryAttrKey);
					// 		subTitles.push([summaryAttrSpec.prettyName, summaryAttrSpec.prettyNameSuffix, that.getTitle()].join(" "));
					// 	});

					// 	var groupByAttrSpec = that.lookUpGroupBySpec(groupByKey);
					// 	var title = subTitles.join(", ");
					// 	title += " by " + groupByAttrSpec.prettyName;
					// 	return title;
					// };

					// burnDownChartConfig.prototype.getChartTitleCumulative = function (summaryKey) {
					// 	var summarySpec = this.lookUpSummarySpec(summaryKey);
					// 	var groupByAttrsPretty = this.getGroupByAttributesPretty();
					// 	var title = [summarySpec.prettyName, summarySpec.prettyNameSuffix, this.getTitle()].join(" ");
					// 	// title += " grouped by " + groupByAttrsPretty.join(", ") + " (in order from outer ring to inner) ";
					// 	// title += " grouped by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];
					// 	// title += " by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];

					// 	title += " by ";
					// 	if( groupByAttrsPretty.length > 1 ){
					// 		title += groupByAttrsPretty.slice(0,-1).join(", ") + " and ";
					// 	}
					// 	title += groupByAttrsPretty.slice(-1)[0];
					// 	return title;
					// };

					$scope.burnDownChartConfigInstance = new burnDownChartConfig($scope.chartConfig);


					// /**************************************************
					//  * GroupBy dropdown helpers
					//  **************************************************/
					// $scope.getGroupBySpecs = function () {
					// 	return $scope.burnDownChartConfigInstance.getGroupByAttributeSpecs({
					// 		allowDisabled: true
					// 	});
					// };

					// $scope.isActiveGroupBy = function (groupByKey) {
					// 	return !$scope.burnDownChartConfigInstance.isDisabledGroupBy(groupByKey);
					// };

					// $scope.toggleGroupBy = function (groupByKey) {
					// 	$scope.burnDownChartConfigInstance.toggleGroupBy(groupByKey);
					// 	// console.log("toggled groupby");
					// 	// console.log($scope.burnDownChartConfigInstance);
					// };

					// /**************************************************
					//  * Summary items dropdown helpers
					//  **************************************************/
					// $scope.getSummaryItemsSpecs = function () {
					// 	return $scope.burnDownChartConfigInstance.getSummaryAttributeSpecs({
					// 		allowDisabled: true
					// 	});
					// };

					// $scope.isActiveSummaryItem = function (summaryItemKey) {
					// 	return !$scope.burnDownChartConfigInstance.isDisabledSummaryItem(summaryItemKey);
					// };

					// $scope.toggleSummaryItem = function (summaryItemKey) {
					// 	$scope.burnDownChartConfigInstance.toggleSummaryItem(summaryItemKey);
					// 	// console.log("toggled summaryItem");
					// 	// console.log($scope.burnDownChartConfigInstance);
					// };

					// /**************************************************
					//  * Cumulative group by toggle helpers
					//  **************************************************/
					// $scope.cumulativeToggleStates = [
					// 	{
					// 		isCumulative: false,
					// 		toolTip: 'Cumulative Group By'
					// 	},
					// 	{
					// 		isCumulative: true,
					// 		toolTip: 'Non Cumulative Group By '
					// 	}
					// ];
					// $scope.cumulativeToggle = ($scope.chartConfig.cumulative) ? $scope.cumulativeToggleStates[1] : $scope.cumulativeToggleStates[0];
					// $scope.toggleCumulative = function () {
					// 	$scope.cumulativeToggle = (!$scope.cumulativeToggle.isCumulative)? $scope.cumulativeToggleStates[1] : $scope.cumulativeToggleStates[0];

					// 	// $scope.chartConfig.cumulative = (!$scope.cumulativeToggle.isCumulative) ? 0 : 1;
					// 	(!$scope.cumulativeToggle.isCumulative) ? $scope.burnDownChartConfigInstance.cumulativeGroupBy(0) : $scope.burnDownChartConfigInstance.cumulativeGroupBy(1);
					// };

					/**************************************************
					 * Data generator for Burn down chart
					 **************************************************/
					// Random data for demo purpose
					// To be removed later
					var getRandomInt = function (min, max) {
						return Math.floor(Math.random() * (max - min)) + min;
					}

					var addStatusLog = function (task, status, date) {
						task.statusLogs = task.statusLogs || [];
						task.statusLogs.push({
							start: date,
							data: {
								status: status
							}
						});
					};

					var generateBurnDownData = function (tasks) {
						var clonedTasks1 = _.clone(tasks);
						var clonedTasks2 = _.clone(tasks);
						var clonedTasks = _.flatten(clonedTasks1, clonedTasks2);
						angular.forEach(clonedTasks, function(task) {
							// get random days
							var randomDaysAgoCreated = getRandomInt(1, 30);
							var randomDaysAgoClosed = getRandomInt(1, randomDaysAgoCreated);
							// var randomDateCreated = moment().subtract(randomDaysAgoCreated, 'days').toDate().getTime();
							// var randomDateClosed = moment().subtract(randomDaysAgoClosed, 'days').toDate().getTime();
							var randomDateCreated = moment().subtract(randomDaysAgoCreated, 'days').toDate();
							var randomDateClosed = moment().subtract(randomDaysAgoClosed, 'days').toDate();
							addStatusLog(task, 'created', randomDateCreated);
							addStatusLog(task, 'closed', randomDateClosed)
						});
						return clonedTasks;
					};

					/**************************************************
					 * New Burn down chart
					 **************************************************/
					var getStatusLogs = function (tasks, status) {
						var statusLogs = [];
						angular.forEach(tasks, function(task) {
							// console.log('status logs are what the !! ==================================================');
							var taskStatuLog = statusLog(task.statusLogs, {lookUp: ['status']});
							// console.log(taskStatuLog.getLookUp('status'));
							statusLogs.push(angular.extend({id: task.$id()}, taskStatuLog.getLookUp('status')[status]));
						});
						console.log('burndown source data !! ==================================================');
						console.log(statusLogs);
						return statusLogs;
					};

					$scope.statusLogsDateMap = {};
					var getStatusLogsDateMap = function (statusLogs, status, outFlow) {
						var datemap;
						var startOrStop = (outFlow)? "stop" : "start";
						if( $scope.statusLogsDateMap[status] && $scope.statusLogsDateMap[status][startOrStop] ){
							datemap = $scope.statusLogsDateMap[status][startOrStop];
							console.log('using pre existing date map !! ==================================================');
						}
						else {
							datemap = {};
							angular.forEach(statusLogs, function(statusLog) {
								var datestring = moment(statusLog[startOrStop]).format("YYYY-MM-DD");
								datemap[datestring] = (!datemap[datestring])? 0 : datemap[datestring];
								datemap[datestring]++;
							});
							console.log('new date map !! ==================================================');
							console.log(datemap);
							$scope.statusLogsDateMap[status] = $scope.statusLogsDateMap[status] || {};
							$scope.statusLogsDateMap[status][startOrStop] = datemap;
						}
						return datemap;
					};

					var getDatesFromToDaysAgo = function (fromDaysAgo, toDaysAgo) {
						// var fromDaysAgo = 31, toDaysAgo = 1;
						var allDays = [];
						if( fromDaysAgo > 0 && toDaysAgo > 0 && fromDaysAgo >= toDaysAgo){
							for(; --fromDaysAgo >= toDaysAgo;){
								allDays.push(moment().subtract(fromDaysAgo, 'days').format("YYYY-MM-DD"));
							}
						}
						return allDays;
					};

					var getDailyFlowData = function (dates, dataDateMap, timeStamp) {
						var chartData = [];
						// timeStamp = timeStamp || "10:00AM";
						angular.forEach(dates, function(datestring) {
							var value = (dataDateMap[datestring])? dataDateMap[datestring] : 0;
							datestring = (timeStamp)? datestring + " " + timeStamp : datestring;
							chartData.push([datestring, value]);
						});
						return chartData;
					};

					var getCumulativeFlowData = function (dates, dataDateMap, offset, timeStamp) {
						var chartData = [];
						// timeStamp = timeStamp || "10:00AM";
						var totalValue = (offset)? offset : 0;
						angular.forEach(dates, function(datestring) {
							totalValue += (dataDateMap[datestring])? dataDateMap[datestring] : 0;
							datestring = (timeStamp)? datestring + " " + timeStamp : datestring;
							chartData.push([datestring, totalValue]);
						});
						return chartData;
					};

 					var getStatusFlowData = function (tasks, status, outFlow, timeStamp, cumulative, offset) {
						var statusLogs = getStatusLogs(tasks, status);
						var datemap = getStatusLogsDateMap(statusLogs, status, outFlow);
						var allDates = getDatesFromToDaysAgo(31, 1);
						var chartData = (cumulative)? getCumulativeFlowData(allDates, datemap, offset, timeStamp) : getDailyFlowData(allDates, datemap, timeStamp);
						return chartData;
					};

 					var getStatusInFlowData = function (tasks, status, timeStamp, cumulative, offset) {
						return getStatusFlowData(tasks, status, undefined, timeStamp, cumulative, offset);
					};

 					var getStatusOutFlowData = function (tasks, status, timeStamp, cumulative, offset) {
						return getStatusFlowData(tasks, status, true, timeStamp, cumulative, offset);
					};

					var addFlows = function (baseFlowData, addFlowData) {
						var resultFlowData = [];
						angular.forEach(baseFlowData, function(baseFlowDataPerDate, baseFlowIndex) {
							var resultValue = baseFlowDataPerDate[1] + addFlowData[baseFlowIndex][1];
							resultFlowData.push([baseFlowDataPerDate[0], resultValue]);
						});
						return resultFlowData;
					};

					var diffFlows = function (baseFlowData, minusFlowData) {
						var resultFlowData = [];
						angular.forEach(baseFlowData, function(baseFlowDataPerDate, baseFlowIndex) {
							var resultValue = baseFlowDataPerDate[1] - minusFlowData[baseFlowIndex][1];
							resultFlowData.push([baseFlowDataPerDate[0], resultValue]);
						});
						return resultFlowData;
					};

					var invertFlow = function (baseFlowData) {
						var resultFlowData = [];
						angular.forEach(baseFlowData, function(baseFlowDataPerDate) {
							var resultValue = baseFlowDataPerDate[1] * -1;
							resultFlowData.push([baseFlowDataPerDate[0], resultValue]);
						});
						return resultFlowData;
					};

					var splitSeries = function (baseFlowData) {
						var dataSeries = [];
						var tickSeries = [];
						angular.forEach(baseFlowData, function(baseFlowDataPerDate) {
							tickSeries.push(baseFlowDataPerDate[0]);
							dataSeries.push(baseFlowDataPerDate[1]);
						});
						return [tickSeries, dataSeries];
					};

					var getAggregateFlowData = function (baseFlowData, addFlows, minusFlows) {
						if( addFlows ){
							angular.forEach(addFlows, function(addFlowData) {
								baseFlowData = addFlows(baseFlowData, addFlowData);
							});
						}
						if( minusFlows ){
							angular.forEach(minusFlows, function(minusFlowData) {
								baseFlowData = diffFlows(baseFlowData, minusFlowData);
							});
						}
						return baseFlowData;
					};


					var getBurnDownData = function (tasks) {
						var totalTasks = getStatusInFlowData(tasks, 'created', null, true, 20);
						var totalClosedTasks = getStatusInFlowData(tasks, 'closed', null, true);
						var openTasks = getAggregateFlowData(totalTasks, null, [totalClosedTasks]);
						return [totalClosedTasks, openTasks, totalTasks];
					};

					// $scope.chartData['data'].unshift($scope.chartData['data'][0]);
					$scope.defaultBurnDownOptions = {
						// title:'Default Date Axis',
						axes:{
							xaxis:{
								renderer:jQuery.jqplot.DateAxisRenderer
							}
						},
						series:[
							{
								label: 'Closed',
								color: '#D1C4B1',
								pointLabels: {
									show: true
								},
								renderer: jQuery.jqplot.BarRenderer,
								showHighlight: true,
								// yaxis: 'y2axis',
								rendererOptions: {
									// Speed up the animation a little bit.
									// This is a number of milliseconds.
									// Default for bar series is 3000.
									animation: {
										speed: 2500
									},
									barWidth: 15,
									barPadding: -15,
									barMargin: 0,
									highlightMouseOver: false
								}
							},
							{
								label: 'Open',
								// color: '#62C0DC',
								color: '#E5220F',
								pointLabels: {
									show: true
								},
								lineWidth:4
							},
							// {
							// 	label: 'Closed',
							// 	lineWidth:2,
							// 	pointLabels: {
							// 		show: true
							// 	}
							// },
							{
								label: 'Total',
								// color: '#D422FF',
								color: '#53027F',
								pointLabels: {
									show: true
								},
								lineWidth:2,
								markerOptions:{style:'square'}
							}
						],
						// y2axis: {
						// 	tickOptions: {
						// 		formatString: "$%'d"
						// 	},
						// 	rendererOptions: {
						// 		// align the ticks on the y2 axis with the y axis.
						// 		alignTicks: true,
						// 		forceTickAt0: true
						// 	}
						// },
						animate: true,
						animateReplot: true,
						cursor: {
							show: true,
							zoom: true,
							looseZoom: true,
							showTooltip: false
						},
						highlighter: {
							show: true,
							showLabel: true,
							tooltipAxes: 'y',
							sizeAdjust: 7.5 , tooltipLocation : 'ne'
						},
						gridPadding: {top:30, bottom:20, left:0, right:0},
						legend:{
							show:true,
							placement: 'inside',
							renderer: jQuery.jqplot.EnhancedLegendRenderer,
							rendererOptions: {
								// numberRows: 2
								numberColumns: 1
							},
							// location:'s',
							marginTop: '15px'
						}
					};

					/**************************************************
					 * Inflow/Outflow Chart Data
					 **************************************************/
					var getDailyInFlowOutFlowData = function (items) {
						var dailyItemsCreated = getStatusInFlowData(items, 'created');
						var dailyItemsClosed = getStatusInFlowData(items, 'closed');
						// dailyItemsClosed = invertFlow(dailyItemsClosed);
						console.log("Inflow outflow data IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
						console.log([dailyItemsClosed, dailyItemsCreated]);
						// return [dailyItemsClosed, dailyItemsCreated];
						return [dailyItemsCreated, dailyItemsClosed];
						// // return [diffFlows(dailyItemsCreated, dailyItemsClosed)];
						// // return [dailyItemsClosed];

						// Category axis render
						// var ticksAndData = splitSeries(dailyItemsClosed);
						// var result = {};
						// result.ticks = ticksAndData[0];
						// result.data = new Array();
						// result.data.push(ticksAndData[1]);
						// ticksAndData = splitSeries(dailyItemsCreated);
						// result.data.push(ticksAndData[1]);
						// return result;
					};

					$scope.defaultInFlowOutFlowOptions = {
						// title:'Default Date Axis',
						axes:{
							xaxis:{
								renderer:jQuery.jqplot.DateAxisRenderer
								// renderer: jQuery.jqplot.CategoryAxisRenderer,
								// tickRenderer: jQuery.jqplot.CanvasAxisTickRenderer,
								// tickOptions: {
								// 	angle: -30
								// }
							}
						},
						seriesDefaults: {
 							// shadow: false,
							pointLabels: {
								show: true
							},
							renderer: jQuery.jqplot.BarRenderer,
							showHighlight: true,
							// yaxis: 'y2axis',
							rendererOptions: {
								fillToZero: true,
								barWidth: 15,
								barPadding: -15,
								barMargin: 0,
								highlightMouseOver: false,
								animation: {
									speed: 2500
								}
							}
						},
						series:[
							{
								label: 'Created',
								// color: '#D422FF'
								color: '#53027F'
							},
							{
								label: 'Closed',
								color: '#D1C4B1'
							}
						],
						animate: true,
						// Will animate plot on calls to plot1.replot({resetAxes:true})
						animateReplot: true,
						cursor: {
							show: true,
							zoom: true,
							looseZoom: true,
							showTooltip: false
						},
						highlighter: {
							show: true,
							showLabel: true,
							tooltipAxes: 'y',
							sizeAdjust: 7.5 , tooltipLocation : 'ne'
						},
						// gridPadding: {top:30, bottom:20, left:0, right:0},
						legend:{
							show:true,
							placement: 'inside',
							renderer: jQuery.jqplot.EnhancedLegendRenderer,
							rendererOptions: {
								// numberRows: 2
								numberColumns: 1
							},
							// location:'s',
							marginTop: '15px'
						}
					};

					/**************************************************
					 * Initialization and watch expressions
					 **************************************************/
					$scope.taskBurnDownData = {};
					$scope.taskInFlowOutFlowData = {};

					$scope.fillChartData = function (items) {
						// console.log("RRRRRRRRRRRRRRRRRRRR");
						// console.log($scope.randomData);
						var itemsData = ($scope.randomData)? generateBurnDownData(items) : items;
						$scope.taskBurnDownData['data'] = getBurnDownData(itemsData);
						var dailyFlowData = getDailyInFlowOutFlowData(itemsData);
						$scope.taskInFlowOutFlowData['data'] = dailyFlowData;
						// Category axis render
						// $scope.taskInFlowOutFlowData['data'] = dailyFlowData.data;
						// $scope.defaultInFlowOutFlowOptions.axes.xaxis.ticks = dailyFlowData.ticks;
					};

					if( $scope.items.length ){
						$scope.fillChartData($scope.items);
					}

					$scope.$watchCollection('items', function (newItems, oldItems) {
						if( !angular.equals(newItems, oldItems) ){
							$scope.fillChartData(newItems);
						}
					});

				}

			]
		};
	}
]);
