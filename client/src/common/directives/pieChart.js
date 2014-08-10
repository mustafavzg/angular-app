angular.module('directives.pieChart', [
	'directives.actionicon',
	'ui.bootstrap',
	'filters.pagination',
	'services.resourceDictionary',
	'services.i18nNotifications',
	'services.crud',
	'services.directiveInitializer',
	'ui.chart',
	'filters.groupBy',
	'filters.groupByFlat',
	'filters.flattenGroupBy',
	'underscore',
	'moment'
])

// A pie chart directive
.directive('pieChart', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/pieChart.tpl.html',
			replace: true,
			scope: {
				items: '=',
				fetchingitems: '=',
  				resourceConfig: '=',
  				chartConfig: '=',
				rootDivClass: '@?',
  				chartOptions: '=?',
				itemToPieData: '&?',
				itemToColor: '&?',
				itemLookUp: '&?'
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
					directiveInitializer
				) {

					var resourceConfig = $scope.resourceConfig;
					$scope.resourcePrettyName = resourceConfig.resource.prettyName;
					$scope.resourcePrettyNameAlt = resourceConfig.resource.altPrettyName;

					// set some defaults for the directive's attributes
 					$scope.self = {};
					var attrsData = {
						attrs: $attrs,
						interpolationKeys: [
							'rootDivClass'
						],
						// expressionKeys: [
						// 	'itemToPieData',
						// 	'itemToColor',
						// 	'itemLookUp'
						// ],
						attrDefaults: {
							rootDivClass: 'panel-body'
						}
					};
					directiveInitializer.init($scope, $scope.self, attrsData);

					// var augmentPieDataSummary = function (taskStatusGroups) {
					// 	angular.forEach(taskStatusGroups, function(taskStatusGroup) {
					// 		var status = taskStatusGroup.key;
					// 		var tasks = taskStatusGroup.values;
					// 		var statusColor = tasks[0].getStatusDef().color;
					// 		var taskCount = tasks.length;
					// 		var totalEstimation = 0, totalRemaining = 0;
					// 		angular.forEach(tasks, function(task) {
					// 			totalEstimation += task.estimation;
					// 			totalRemaining += task.remaining;
					// 		});
					// 		taskStatusGroup.summary = {
					// 			status: taskStatusGroup.key,
					// 			color: statusColor,
					// 			tasks: tasks,
					// 			count: taskCount,
					// 			estimation: totalEstimation,
					// 			remaining: totalRemaining
					// 		};
					// 	});

					// 	return _.sortBy(
					// 		taskStatusGroups,
					// 		function (taskStatusGroup) {
					// 			return taskStatusGroup.summary.count * -1;
					// 		}
					// 	);
					// };

					// $scope.pieChartConfigSample = {
					// 	title: 'Tasks',
					// 	groupBy: [
					// 		{
					// 			prettyName: 'Status',
					// 			key: 'status'
					// 		}
					// 	],
					// 	summary: [
					// 		{
					// 			prettyName: 'Estimation',
					// 			key: 'estimation'
					// 		},
					// 		{
					// 			prettyName: 'Remaining',
					// 			key: 'remaining'
					// 		}
					// 	],
					// 	count: 1
					// };

					// var getPieChartsOld = function (tasks) {
					// 	// var taskStatusGroups = groupByFilter(tasks, "status");
					// 	var taskStatusGroups = groupByFlatFilter(tasks, "status");
					// 	console.log("task groups are");
					// 	console.log(taskStatusGroups);

					// 	// console.log("testing the filters");
					// 	// var taskStatusGroupsTest = groupByFilter(tasks, "status", "assignedUserId");
					// 	// console.log("group by");
					// 	// console.log(taskStatusGroupsTest);

					// 	// taskStatusGroupsTest = flattenGroupByFilter(taskStatusGroupsTest, true);
					// 	// console.log("flatten group by");
					// 	// console.log(taskStatusGroupsTest);

					// 	// console.log("group by flat");
					// 	// taskStatusGroupsTest = groupByFlatFilter(tasks, "status", "assignedUserId");
					// 	// console.log(taskStatusGroupsTest);

					// 	var sortedTaskStatusGroups = augmentPieDataSummary(taskStatusGroups);
					// 	console.log("sorted task status grousp");
					// 	console.log(sortedTaskStatusGroups);
					// 	var pieChartColors = getSeriesColors(sortedTaskStatusGroups);
					// 	angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
					// 		var pieChart = {};
					// 		console.log("data key");
					// 		console.log(dataKey);
					// 		pieChart.data = [pieChartDataSource[dataKey](sortedTaskStatusGroups)];
					// 		pieChart.options = _.clone($scope.defaultPieOptions);
					// 		pieChart.options.seriesColors = pieChartColors;
					// 		$scope.pieCharts.push(pieChart);
					// 	});
					// 	console.log("pie charts");
					// 	console.log($scope.pieCharts);
					// };

					var pieChartConfig = function (config) {
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

					pieChartConfig.lookUpSpec = function (specKey, specDictionary) {
						return specDictionary.lookUpItem(specKey);
					};

					pieChartConfig.prototype.lookUpGroupBySpec = function (specKey) {
						return pieChartConfig.lookUpSpec(specKey, this.groupByDictionary);
					};

					pieChartConfig.prototype.lookUpSummarySpec = function (specKey) {
						if( specKey === "count" ){
							return {
								prettyName: "Number",
								prettyNameSuffix: "of"
							};
						}
						else {
							return pieChartConfig.lookUpSpec(specKey, this.summaryItemsDictionary);
						}
					};

					pieChartConfig.getAttributes = function (attrSpecs, attrKey, orderingOptions) {
						if( _.isObject(orderingOptions) ){
							if( !_.isUndefined(orderingOptions.orderingKey) ){
								attrSpecs = _.sortBy(attrSpecs, function (attrSpec) {
									return attrSpec[orderingOptions.orderingKey];
								});
							}
							else if( _.isArray(orderingOptions.customOrder) ){
								// Note: for custom order, pass in the corresponding the dictionary
								// for lookup
								attrSpecs = _.map(orderingOptions.customOrder, function (key) {
									return orderingOptions.dictionary.lookUpItem(key);
								});
							}
						}

						return _.map(
							attrSpecs,
							function (attrSpec) {
								return attrSpec[attrKey];
							}
						);
					};

					pieChartConfig.getAttributeKeys = function (attrSpecs, orderingOptions) {
						// return pieChartConfig.getAttributes(attrSpecs, 'key', 'ordering');
						return pieChartConfig.getAttributes(attrSpecs, 'key', orderingOptions);
					};

					pieChartConfig.getAttributeDisplayNames = function (attrSpecs, orderingOptions) {
						// return pieChartConfig.getAttributes(attrSpecs, 'prettyName', 'ordering');
						return pieChartConfig.getAttributes(attrSpecs, 'prettyName', orderingOptions);
					};

					pieChartConfig.prototype.getGroupByAttributes = function (customOrder) {
						// return pieChartConfig.getAttributeKeys(this.groupBy);
						var that = this;
						if( _.isArray(customOrder) ){
							return pieChartConfig.getAttributeKeys(that.groupBy, {
								customOrder: customOrder,
								// customOrder: ['type', 'status'],
								// customOrder: ['status', 'type'],
								dictionary: that.groupByDictionary
							});
						}
						else {
							return pieChartConfig.getAttributeKeys(that.groupBy, {
								orderingKey: 'ordering'
							});
						}
					};

					pieChartConfig.prototype.getGroupByAttributesPretty = function (customOrder) {
						// return pieChartConfig.getAttributeDisplayNames(this.groupBy);
						var that = this;
						if( _.isArray(customOrder) ){
							return pieChartConfig.getAttributeDisplayNames(that.groupBy, {
								customOrder: customOrder,
								// customOrder: ['type', 'status'],
								// customOrder: ['status', 'type'],
								dictionary: that.groupByDictionary
							});
						}
						else {
							return pieChartConfig.getAttributeDisplayNames(that.groupBy, {
								orderingKey: 'ordering'
							});
						}
					};

					pieChartConfig.prototype.getSummaryAttributes = function (customOrder) {
						// return pieChartConfig.getAttributeKeys(this.summary);
						var that = this;
						if( _.isArray(customOrder) ){
						// if( 1 ){
							return pieChartConfig.getAttributeKeys(that.summary, {
								customOrder: customOrder,
								// customOrder: ['estimation', 'remaining'],
								// customOrder: ['remaining', 'estimation'],
								dictionary: that.summaryItemsDictionary
							});
						}
						else {
							return pieChartConfig.getAttributeKeys(that.summary, {
								orderingKey: 'ordering'
							});
						}
					};

					pieChartConfig.prototype.getSummaryAttributesPretty = function (customOrder) {
						// return pieChartConfig.getAttributeDisplayNames(this.summary);
						var that = this;
						if( _.isArray(customOrder) ){
							return pieChartConfig.getAttributeDisplayNames(that.summary, {
								customOrder: customOrder,
								// customOrder: ['type', 'status'],
								// customOrder: ['status', 'type'],
								dictionary: that.summaryItemsDictionary
							});
						}
						else {
							return pieChartConfig.getAttributeDisplayNames(that.summary, {
								orderingKey: 'ordering'
							});
						}
					};

					pieChartConfig.prototype.getColorMap = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return (!angular.isDefined(groupBySpec) || !angular.isDefined(groupBySpec.colorMap))? angular.noop : groupBySpec.colorMap;
					};

					pieChartConfig.prototype.getCount = function () {
						return this.count;
					};

					pieChartConfig.prototype.collapseCharts = function () {
						return this.collapse;
					};

					pieChartConfig.prototype.cumulativeGroupBy = function () {
						return this.cumulative;
					};

					pieChartConfig.prototype.getTitle = function () {
						return this.title;
					};

					pieChartConfig.prototype.getChartTitle = function (groupByKey) {
						var that = this;
						var summaryAttrs = that.getSummaryAttributes();
						// var summaryAttrsPretty = this.getSummaryAttributesPretty();
						var subTitles = [];
						_.each(summaryAttrs, function (summaryAttrKey, index) {
							var summaryAttrSpec = that.lookUpSummarySpec(summaryAttrKey);
							subTitles.push([summaryAttrSpec.prettyName, summaryAttrSpec.prettyNameSuffix, that.getTitle()].join(" "));
						});
						var groupByAttrSpec = that.lookUpGroupBySpec(groupByKey);
						var title = subTitles.join(", ");
						title += " by " + groupByAttrSpec.prettyName;
						return title;
					};

					pieChartConfig.prototype.getChartTitleCumulative = function (summaryKey) {
						var summarySpec = this.lookUpSummarySpec(summaryKey);
						var groupByAttrsPretty = this.getGroupByAttributesPretty();
						var title = [summarySpec.prettyName, summarySpec.prettyNameSuffix, this.getTitle()].join(" ");
						// title += " grouped by " + groupByAttrsPretty.join(", ") + " (in order from outer ring to inner) ";
						// title += " grouped by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];
						title += " by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];
						return title;
					};

					// var summarizePieData = function (items, config) {
					// 	var groupByAttrs = config.getGroupByAttributes();
					// 	// console.log("group by attrs");
					// 	// console.log(groupByAttrs);

					// 	var itemGroups = groupByFlatFilter(items, groupByAttrs);
					// 	// console.log("item groups before summarize");
					// 	// console.log(itemGroups);

					// 	var summaryAttrs = config.getSummaryAttributes();
					// 	angular.forEach(itemGroups, function(itemGroup) {
					// 		itemGroup.summary = {};

					// 		angular.forEach(groupByAttrs, function(attrKey) {
					// 			// itemGroup.summary[attrKey] = itemGroup.key;
					// 			_.extend(itemGroup.summary, itemGroup.getTargetValues());
					// 		});

					// 		// var status = itemGroup.key;
					// 		var items = itemGroup.values;

					// 		// color
					// 		// var statusColor = items[0].getStatusDef().color;
					// 		_.extend(itemGroup.summary, {color: items[0].getStatusDef().color});

					// 		// count
					// 		if( config.getCount() ){
					// 			// var itemCount = items.length;
					// 			_.extend(itemGroup.summary, {count: items.length});
					// 		}

					// 		// summary items
					// 		// var totalEstimation = 0, totalRemaining = 0;
					// 		angular.forEach(summaryAttrs, function(summaryAttr) {
					// 			itemGroup.summary[summaryAttr] = 0;
					// 		});
					// 		angular.forEach(items, function(item) {
					// 			// totalEstimation += item.estimation;
					// 			// totalRemaining += item.remaining;
					// 			angular.forEach(summaryAttrs, function(summaryAttr) {
					// 				itemGroup.summary[summaryAttr] += item[summaryAttr];
					// 			});
					// 		});

					// 		// itemGroup.summary = {
					// 		// 	status: itemGroup.key,
					// 		// 	color: statusColor,
					// 		// 	items: items,
					// 		// 	count: itemCount,
					// 		// 	estimation: totalEstimation,
					// 		// 	remaining: totalRemaining
					// 		// }
					// 	});

					// 	console.log("itemgroups after summarize");
					// 	console.log(itemGroups);

					// 	// !!!
					// 	return _.sortBy(
					// 		itemGroups,
					// 		function (itemGroup) {
					// 			return itemGroup.summary.count * -1;
					// 		}
					// 	);
					// };

					var _summarizeItemGroups = function (itemGroups, config, groupByKey) {
						var summaryAttrs = config.getSummaryAttributes();
						// var groupByKey = itemGroups[0].getTargets()
						var colorMapFn = config.getColorMap(groupByKey);
						angular.forEach(itemGroups, function(itemGroup) {
							itemGroup.summary = {};

							_.extend(itemGroup.summary, itemGroup.getTargetValues());
							// angular.forEach(groupByAttrs, function(attrKey) {
							// 	_.extend(itemGroup.summary, itemGroup.getTargetValues());
							// });

							// var status = itemGroup.key;
							var items = itemGroup.values;

							// color
							// var statusColor = items[0].getStatusDef().color;

							// _.extend(itemGroup.summary, {color: colorMapFn(items[0]) || '#AE4A32'});
							_.extend(itemGroup.summary, {color: colorMapFn(items[0])});

							// count
							if( config.getCount() ){
								_.extend(itemGroup.summary, {count: items.length});
							}

							// summary items
							// var totalEstimation = 0, totalRemaining = 0;
							angular.forEach(summaryAttrs, function(summaryAttr) {
								itemGroup.summary[summaryAttr] = 0;
							});
							angular.forEach(items, function(item) {
								// totalEstimation += item.estimation;
								// totalRemaining += item.remaining;
								angular.forEach(summaryAttrs, function(summaryAttr) {
									itemGroup.summary[summaryAttr] += item[summaryAttr];
								});
							});
						});
					};

					var summarizePieData = function (items, config) {
						var groupByAttrs = config.getGroupByAttributes();
						// console.log("group by attrs");
						// console.log(groupByAttrs);

						// var itemGroups = groupByFlatFilter(items, groupByAttrs);
						// console.log("item groups before summarize");
						// console.log(itemGroups);

						// mutually exclusive groupBy
						// return itemGroup Sets for each groupBy
						// var summaryAttrs = config.getSummaryAttributes();
						// if( config.getCount() ){
						// 	summaryAttrs.push('count');
						// }

						// mutually exclusive groupBy
						var summarizedItemGroups = {};
						if( config.cumulativeGroupBy() ){
							var targets = [];
							angular.forEach(groupByAttrs, function(groupByKey) {

								// itemGroup.summary[groupByKey] = itemGroup.key;
								targets.push(groupByKey);
								console.log("targets are");
								console.log(targets.toString());
								var itemGroups = groupByFlatFilter(items, targets);
								_summarizeItemGroups(itemGroups, config, groupByKey);
								console.log("itemgroups after summarize");
								console.log(itemGroups);
								// summarizedItemGroups[groupByKey] = itemGroups;
								summarizedItemGroups[targets.join("::")] = itemGroups;

								// !!!
								// return _.sortBy(
								// 	itemGroups,
								// 	function (itemGroup) {
								// 		return itemGroup.summary.count * -1;
								// 	}
								// );
							});
						}
						else {
							angular.forEach(groupByAttrs, function(groupByKey) {

								// itemGroup.summary[groupByKey] = itemGroup.key;
								var itemGroups = groupByFlatFilter(items, groupByKey);
								_summarizeItemGroups(itemGroups, config, groupByKey);
								console.log("itemgroups after summarize");
								console.log(itemGroups);
								summarizedItemGroups[groupByKey] = itemGroups;

								// !!!
								// return _.sortBy(
								// 	itemGroups,
								// 	function (itemGroup) {
								// 		return itemGroup.summary.count * -1;
								// 	}
								// );
							});
						}

						return summarizedItemGroups;

						// angular.forEach(itemGroups, function(itemGroup) {
						// 	itemGroup.summary = {};

						// 	angular.forEach(groupByAttrs, function(attrKey) {
						// 		// itemGroup.summary[attrKey] = itemGroup.key;
						// 		_.extend(itemGroup.summary, itemGroup.getTargetValues());
						// 	});

						// 	// var status = itemGroup.key;
						// 	var items = itemGroup.values;

						// 	// color
						// 	// var statusColor = items[0].getStatusDef().color;
						// 	_.extend(itemGroup.summary, {color: items[0].getStatusDef().color});

						// 	// count
						// 	if( config.getCount() ){
						// 		// var itemCount = items.length;
						// 		_.extend(itemGroup.summary, {count: items.length});
						// 	}

						// 	// summary items
						// 	// var totalEstimation = 0, totalRemaining = 0;
						// 	angular.forEach(summaryAttrs, function(summaryAttr) {
						// 		itemGroup.summary[summaryAttr] = 0;
						// 	});
						// 	angular.forEach(items, function(item) {
						// 		// totalEstimation += item.estimation;
						// 		// totalRemaining += item.remaining;
						// 		angular.forEach(summaryAttrs, function(summaryAttr) {
						// 			itemGroup.summary[summaryAttr] += item[summaryAttr];
						// 		});
						// 	});

						// 	// itemGroup.summary = {
						// 	// 	status: itemGroup.key,
						// 	// 	color: statusColor,
						// 	// 	items: items,
						// 	// 	count: itemCount,
						// 	// 	estimation: totalEstimation,
						// 	// 	remaining: totalRemaining
						// 	// }
						// });

						// console.log("itemgroups after summarize");
						// console.log(itemGroups);

						// // !!!
						// return _.sortBy(
						// 	itemGroups,
						// 	function (itemGroup) {
						// 		return itemGroup.summary.count * -1;
						// 	}
						// );

					};

					var getSeriesColors = function (itemGroups) {
						return _.map(itemGroups, function (itemGroup) {
								   return itemGroup.summary.color;
							   });
					};

					var getPieChartDataSources = function (config) {
						var pieChartDataSource = {};
						var groupByAttrs = config.getGroupByAttributes();
						var summaryAttrs = config.getSummaryAttributes();
						if( config.getCount() ){
							summaryAttrs.unshift('count');
						}

						if( config.cumulativeGroupBy() ){
							angular.forEach(summaryAttrs, function(summaryAttr) {
								pieChartDataSource[summaryAttr] = pieChartDataSource[summaryAttr] || {};
								var targets = [];
								angular.forEach(groupByAttrs, function(groupByAttr) {
									targets.push(groupByAttr);
									// pieChartDataSource[summaryAttr][groupByAttr] = function (itemGroups) {
									pieChartDataSource[summaryAttr][targets.join("::")] = function (itemGroups) {
										return _.map(
											itemGroups,
											function (itemGroup) {
												var data = itemGroup.summary;
												var selectData = _.chain(data).pick(targets).values().value().join("::");
												// return [data[groupByAttr], data[summaryAttr]];
												return [selectData, data[summaryAttr]];
											}
										);
									};
								});
							});
						}
						else {
							angular.forEach(groupByAttrs, function(groupByAttr) {
								pieChartDataSource[groupByAttr] = pieChartDataSource[groupByAttr] || {};
								angular.forEach(summaryAttrs, function(summaryAttr) {
									pieChartDataSource[groupByAttr][summaryAttr] = function (itemGroups) {
										return _.map(
											itemGroups,
											function (itemGroup) {
												var data = itemGroup.summary;
												return [data[groupByAttr], data[summaryAttr]];
											}
										);
									};
								});
							});
						}

						return pieChartDataSource;
					};

					// var pieChartDataSource = {
					// 	counts: function (itemGroups) {
					// 		return _.map(itemGroups, function (itemGroup) {
					// 				   var data = itemGroup.summary;
					// 				   return [data.status, data.count];
					// 			   });
					// 	},
					// 	estimations: function (itemGroups) {
					// 		return _.map(itemGroups, function (itemGroup) {
					// 				   var data = itemGroup.summary;
					// 				   return [data.status, data.estimation];
					// 			   });
					// 	},
					// 	remainings: function (itemGroups) {
					// 		return _.map(itemGroups, function (itemGroup) {
					// 				   var data = itemGroup.summary;
					// 				   return [data.status, data.remaining];
					// 			   });
					// 	}
					// };

					$scope.pieCharts = [];
					$scope.defaultPieOptions = {
						gridPadding: {top:30, bottom:20, left:0, right:0},
						// seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
						seriesDefaults:{
							shadow: false,
							renderer: jQuery.jqplot.PieRenderer,
							// trendline:{ show:false },
							rendererOptions: {
								padding: 8,
								showDataLabels: true,
								sliceMargin: 5,
								// highlight not working !!!
								highlightMouseOver: true,
								startAngle: 270
							}
						},
						legend:{
							show:true,
							placement: 'inside',
							rendererOptions: {
								// numberRows: 2
								numberColumns: 1
							},
							// location:'s',
							marginTop: '15px'
						}
						// seriesDefaults:{
						// 	shadow: false,
						// 	renderer:$.jqplot.PieRenderer,
						// 	rendererOptions:{
						// 		sliceMargin: 4,
						// 		// rotate the starting position of the pie around to 12 o'clock.
						// 		startAngle: -90
						// 	}
						// },
						// legend:{ show: true }
						// seriesDefaults: {
						// 	// Make this a pie chart.
						// 	renderer: jQuery.jqplot.PieRenderer,
						// 	rendererOptions: {
						// 		// Put data labels on the pie slices.
						// 		// By default, labels show the percentage of the slice.
						// 		showDataLabels: true
						// 	}
						// },
						// legend: { show:true, location: 'e' }
					};

					$scope.defaultDonutOptions = {
						gridPadding: {top:30, bottom:20, left:0, right:0},
						// gridPadding: {top:0, bottom:38, left:0, right:0},
						// seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
						seriesDefaults: {
							// make this a donut chart.
							renderer:jQuery.jqplot.DonutRenderer,
							shadow: false,
							rendererOptions:{
								// Donut's can be cut into slices like pies.
								sliceMargin: 3,
								// Pies and donuts can start at any arbitrary angle.
								// startAngle: -90,
								showDataLabels: true,
								// By default, data labels show the percentage of the donut/pie.
								// You can show the data 'value' or data 'label' instead.
								// dataLabels: 'value'
								highlightMouseOver: true,
								startAngle: 270
							}
						},
						legend:{
							show:true,
							placement: 'inside',
							rendererOptions: {
								// numberRows: 2
								numberColumns: 1
							},
							seriesToggle: 'normal',
							// location:'s',
							marginTop: '15px'
						}
					};

					var getPieCharts = function (items, config) {
						// var groupByColumns = config.getGroupByColumns();
						// var itemGroups = groupByFilter(items, groupByColumns);
						config = new pieChartConfig(config);
						console.log("config blessed is ");
						console.log(config);

						var summarizedItemGroups = summarizePieData(items, config);
						console.log("sorted item status grousp");
						console.log(summarizedItemGroups);

						$scope.pieCharts = [];
						var pieChartDataSource = getPieChartDataSources(config);

						// >>> flip summary and groupby
						if( config.cumulativeGroupBy() ){
							// angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
							var groupByAttrs = config.getGroupByAttributes();
							var groupByAttrsPretty = config.getGroupByAttributesPretty();
							angular.forEach(pieChartDataSource, function(pieChartDataSources, summaryKey) {
								if( config.collapseCharts() ){
									var pieChart = {};
									pieChart.options = _.clone($scope.defaultDonutOptions);
									pieChart.data = [];
									pieChart.options.series = [];

									// var summarySpec = config.lookUpSummarySpec(summaryKey);
									// pieChart.options.title = [summarySpec.prettyName, summarySpec.prettyNameSuffix, config.getTitle()].join(" ");
									// // pieChart.options.title += " grouped by " + groupByAttrsPretty.join(", ") + " (in order from outer ring to inner) ";
									// pieChart.options.title += " grouped by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];

									pieChart.options.title = config.getChartTitleCumulative(summaryKey);

									angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
										console.log("groupByKey");
										console.log(groupByKey);
										pieChart.data.push(pieChartDataSources[groupByKey](itemGroups));
										pieChart.options.series.push({
											label: groupByKey,
											seriesColors: getSeriesColors(itemGroups)
											// legend: $scope.defaultDonutOptions.legend
										});
									});
									// pieChart.data.reverse();
									// pieChart.options.series.reverse();

									$scope.pieCharts.push(pieChart);
								}
								else {
									angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
										// angular.forEach(pieChartDataSource, function(pieChartDataSourceFn, groupByKey) {
										if( groupByAttrs.join("::") ===  groupByKey){
											var pieChart = {};
											console.log("groupByKey");
											console.log(groupByKey);
											// pieChart.data = [pieChartDataSource[groupByKey](itemGroups)];
											pieChart.data = [pieChartDataSources[groupByKey](itemGroups)];
											pieChart.options = _.clone($scope.defaultPieOptions);
											// pieChart.options.title = config.getTitle();
											pieChart.options.title = config.getChartTitleCumulative(summaryKey);
											// pieChart.options.seriesColors = getSeriesColors(itemGroups);
											$scope.pieCharts.push(pieChart);
										}
									});
								}
							});

						}
						else {
							angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
								if( config.collapseCharts() ){
									var pieChart = {};
									pieChart.options = _.clone($scope.defaultDonutOptions);
									pieChart.data = [];
									// pieChart.options.seriesColors = [];
									pieChart.options.seriesColors = getSeriesColors(itemGroups);
									// angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
									angular.forEach(pieChartDataSource[groupByKey], function(pieChartDataSourceFn, dataKey) {
										// angular.forEach(pieChartDataSource, function(pieChartDataSourceFn, dataKey) {
										console.log("data key");
										console.log(dataKey);
										// pieChart.data = [pieChartDataSource[dataKey](itemGroups)];
										pieChart.data.push(pieChartDataSourceFn(itemGroups));
										// pieChart.options.seriesColors.push(getSeriesColors(itemGroups));
									});
									$scope.pieCharts.push(pieChart);
								}
								else {
									// angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
									angular.forEach(pieChartDataSource[groupByKey], function(pieChartDataSourceFn, dataKey) {
										// angular.forEach(pieChartDataSource, function(pieChartDataSourceFn, dataKey) {
										var pieChart = {};
										console.log("data key");
										console.log(dataKey);
										// pieChart.data = [pieChartDataSource[dataKey](itemGroups)];
										pieChart.data = [pieChartDataSourceFn(itemGroups)];
										pieChart.options = _.clone($scope.defaultPieOptions);
										pieChart.options.seriesColors = getSeriesColors(itemGroups);
										$scope.pieCharts.push(pieChart);
									});
								}
							});

						}

						console.log("pie charts");
						console.log($scope.pieCharts);
					};


					// var getPieCharts = function (items, config) {
					// 	// var groupByColumns = config.getGroupByColumns();
					// 	// var itemGroups = groupByFilter(items, groupByColumns);
					// 	config = new pieChartConfig(config);
					// 	console.log("config blessed is ");
					// 	console.log(config);

					// 	var sortedItemGroups = summarizePieData(items, config);
					// 	console.log("sorted item status grousp");
					// 	console.log(sortedItemGroups);
					// 	var pieChartColors = getSeriesColors(sortedItemGroups);
					// 	$scope.pieCharts = [];

					// 	// var pieChartDataSource = getPieChartDataSources(config);

					// 	if( config.collapseCharts() ){
					// 		var pieChart = {};
					// 		pieChart.options = _.clone($scope.defaultDonutOptions);
					// 		pieChart.options.seriesColors = pieChartColors;
					// 		pieChart.data = [];
					// 		angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
					// 			console.log("data key");
					// 			console.log(dataKey);
					// 			pieChart.data.push(pieChartDataSource[dataKey](sortedItemGroups));
					// 		});
					// 		$scope.pieCharts.push(pieChart);
					// 	}
					// 	else {
					// 		angular.forEach(_.keys(pieChartDataSource), function(dataKey) {
					// 			var pieChart = {};
					// 			console.log("data key");
					// 			console.log(dataKey);
					// 			pieChart.data = [pieChartDataSource[dataKey](sortedItemGroups)];
					// 			pieChart.options = _.clone($scope.defaultPieOptions);
					// 			pieChart.options.seriesColors = pieChartColors;
					// 			$scope.pieCharts.push(pieChart);
					// 		});
					// 	}
					// 	console.log("pie charts");
					// 	console.log($scope.pieCharts);
					// };

					if( $scope.items.length ){
						getPieCharts($scope.items, $scope.chartConfig);
					}

					$scope.$watchCollection('items', function (newObj, oldObj) {
						if( !angular.equals(newObj, oldObj) ){
							getPieCharts($scope.items, $scope.chartConfig);
						}
					});

					// $scope.tasksPieData = [[
					// 	['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14],
					// 	['Out of home', 16],['Commuting', 7], ['Orientation', 9]
					// ]];

					// $scope.tasksPieOptions = {
					// 	gridPadding: {top:0, bottom:38, left:0, right:0},
					// 	seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
					// 	seriesDefaults:{
					// 		shadow: true,
					// 		renderer: jQuery.jqplot.PieRenderer,
					// 		trendline:{ show:false },
					// 		rendererOptions: { padding: 8, showDataLabels: true }
					// 	},
					// 	legend:{
					// 		show:true,
					// 		placement: 'inside',
					// 		rendererOptions: {
					// 			// numberRows: 2
					// 			numberColumns: 1
					// 		},
					// 		// location:'s',
					// 		marginTop: '15px'
					// 	}
					// 	// seriesDefaults:{
					// 	// 	shadow: false,
					// 	// 	renderer:$.jqplot.PieRenderer,
					// 	// 	rendererOptions:{
					// 	// 		sliceMargin: 4,
					// 	// 		// rotate the starting position of the pie around to 12 o'clock.
					// 	// 		startAngle: -90
					// 	// 	}
					// 	// },
					// 	// legend:{ show: true }
					// 	// seriesDefaults: {
					// 	// 	// Make this a pie chart.
					// 	// 	renderer: jQuery.jqplot.PieRenderer,
					// 	// 	rendererOptions: {
					// 	// 		// Put data labels on the pie slices.
					// 	// 		// By default, labels show the percentage of the slice.
					// 	// 		showDataLabels: true
					// 	// 	}
					// 	// },
					// 	// legend: { show:true, location: 'e' }
					// };

				}
			]
		};
	}
]);
