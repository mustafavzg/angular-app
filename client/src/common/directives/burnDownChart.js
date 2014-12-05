angular.module('directives.burnDownChart', [
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
  				chartData: '=',
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
						// 	'itemToPieData',
						// 	'itemToColor',
						// 	'itemLookUp'
						// ],
						attrDefaults: {
							rootDivClass: 'panel-body'
						}
					};
					directiveInitializer.init($scope, $scope.self, attrsData);

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

						if( !_.isUndefined(attrKey) ){
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

					burnDownChartConfig.prototype.getGroupByAttributes = function (options) {
						var that = this;
						return burnDownChartConfig.getAttributeKeys(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));
					};

					burnDownChartConfig.prototype.getGroupByAttributesPretty = function (customOrder) {
						// return burnDownChartConfig.getAttributeDisplayNames(this.groupBy);
						var that = this;
						if( _.isArray(customOrder) ){
							return burnDownChartConfig.getAttributeDisplayNames(that.groupBy, {
								customOrder: customOrder,
								// customOrder: ['type', 'status'],
								// customOrder: ['status', 'type'],
								dictionary: that.groupByDictionary
							});
						}
						else {
							return burnDownChartConfig.getAttributeDisplayNames(that.groupBy, {
								orderingKey: 'ordering'
							});
						}
					};

					burnDownChartConfig.prototype.getSummaryAttributeSpecs = function (options) {
						var that = this;
						return burnDownChartConfig.getAttributes(that.summary, angular.extend({}, options, {
							dictionary: that.summaryItemsDictionary,
							orderingKey: 'ordering'
						}));
					};

					burnDownChartConfig.prototype.getSummaryAttributes = function (customOrder) {
						// return burnDownChartConfig.getAttributeKeys(this.summary);
						var that = this;
						if( _.isArray(customOrder) ){
						// if( 1 ){
							return burnDownChartConfig.getAttributeKeys(that.summary, {
								customOrder: customOrder,
								// customOrder: ['estimation', 'remaining'],
								// customOrder: ['remaining', 'estimation'],
								dictionary: that.summaryItemsDictionary
							});
						}
						else {
							return burnDownChartConfig.getAttributeKeys(that.summary, {
								orderingKey: 'ordering'
							});
						}
					};

					burnDownChartConfig.prototype.getSummaryAttributesPretty = function (customOrder) {
						// return burnDownChartConfig.getAttributeDisplayNames(this.summary);
						var that = this;
						if( _.isArray(customOrder) ){
							return burnDownChartConfig.getAttributeDisplayNames(that.summary, {
								customOrder: customOrder,
								// customOrder: ['type', 'status'],
								// customOrder: ['status', 'type'],
								dictionary: that.summaryItemsDictionary
							});
						}
						else {
							return burnDownChartConfig.getAttributeDisplayNames(that.summary, {
								orderingKey: 'ordering'
							});
						}
					};

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

					burnDownChartConfig.prototype.collapseCharts = function (setCollapse) {
						if( angular.isDefined(setCollapse) ){
							this.collapse = setCollapse;
						}
						return this.collapse;
					};

					burnDownChartConfig.prototype.cumulativeGroupBy = function (setCumulative) {
						if( angular.isDefined(setCumulative) ){
							this.cumulative = setCumulative;
						}
						return this.cumulative;
					};

					burnDownChartConfig.prototype.getTitle = function () {
						return this.title;
					};

					burnDownChartConfig.prototype.getChartTitle = function (groupByKey, summaryKey) {
						var that = this;
						var subTitles = [];
						var summaryAttrs;
						// if summary is undefined, get all the summary keys
						if( _.isUndefined(summaryKey) ){
							summaryAttrs = that.getSummaryAttributes();
							// var summaryAttrsPretty = this.getSummaryAttributesPretty();
							if( that.getCount() ){
								summaryAttrs.unshift('count');
								// subTitles.unshift(['Number', 'of', that.getTitle()].join(" "));
							}
						}
						else {
							summaryAttrs = [summaryKey];
						}
						_.each(summaryAttrs, function (summaryAttrKey, index) {
							var summaryAttrSpec = that.lookUpSummarySpec(summaryAttrKey);
							subTitles.push([summaryAttrSpec.prettyName, summaryAttrSpec.prettyNameSuffix, that.getTitle()].join(" "));
						});

						var groupByAttrSpec = that.lookUpGroupBySpec(groupByKey);
						var title = subTitles.join(", ");
						title += " by " + groupByAttrSpec.prettyName;
						return title;
					};

					burnDownChartConfig.prototype.getChartTitleCumulative = function (summaryKey) {
						var summarySpec = this.lookUpSummarySpec(summaryKey);
						var groupByAttrsPretty = this.getGroupByAttributesPretty();
						var title = [summarySpec.prettyName, summarySpec.prettyNameSuffix, this.getTitle()].join(" ");
						// title += " grouped by " + groupByAttrsPretty.join(", ") + " (in order from outer ring to inner) ";
						// title += " grouped by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];
						// title += " by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];

						title += " by ";
						if( groupByAttrsPretty.length > 1 ){
							title += groupByAttrsPretty.slice(0,-1).join(", ") + " and ";
						}
						title += groupByAttrsPretty.slice(-1)[0];
						return title;
					};

					$scope.burnDownChartConfigInstance = new burnDownChartConfig($scope.chartConfig);

					/**************************************************
					 * GroupBy dropdown helpers
					 **************************************************/
					$scope.getGroupBySpecs = function () {
						return $scope.burnDownChartConfigInstance.getGroupByAttributeSpecs({
							allowDisabled: true
						});
					};

					$scope.isActiveGroupBy = function (groupByKey) {
						return !$scope.burnDownChartConfigInstance.isDisabledGroupBy(groupByKey);
					};

					$scope.toggleGroupBy = function (groupByKey) {
						$scope.burnDownChartConfigInstance.toggleGroupBy(groupByKey);
						// console.log("toggled groupby");
						// console.log($scope.burnDownChartConfigInstance);
					};


					/**************************************************
					 * Summary items dropdown helpers
					 **************************************************/
					$scope.getSummaryItemsSpecs = function () {
						return $scope.burnDownChartConfigInstance.getSummaryAttributeSpecs({
							allowDisabled: true
						});
					};

					$scope.isActiveSummaryItem = function (summaryItemKey) {
						return !$scope.burnDownChartConfigInstance.isDisabledSummaryItem(summaryItemKey);
					};

					$scope.toggleSummaryItem = function (summaryItemKey) {
						$scope.burnDownChartConfigInstance.toggleSummaryItem(summaryItemKey);
						// console.log("toggled summaryItem");
						// console.log($scope.burnDownChartConfigInstance);
					};

					/**************************************************
					 * Donut toggle helpers
					 **************************************************/
					$scope.donutToggleStates = [
						{
							isDonut: false,
							toolTip: 'Donut Chart'
						},
						{
							isDonut: true,
							toolTip: 'Pie Chart'
						}
					];
					// $scope.donutToggle = $scope.donutToggleStates[1];
					$scope.donutToggle = ($scope.chartConfig.collapse) ? $scope.donutToggleStates[1] : $scope.donutToggleStates[0];
					$scope.toggleDonut = function () {
						$scope.donutToggle = (!$scope.donutToggle.isDonut)? $scope.donutToggleStates[1] : $scope.donutToggleStates[0];
						(!$scope.donutToggle.isDonut) ? $scope.burnDownChartConfigInstance.collapseCharts(0) : $scope.burnDownChartConfigInstance.collapseCharts(1);
					};

					/**************************************************
					 * Cumulative group by toggle helpers
					 **************************************************/
					$scope.cumulativeToggleStates = [
						{
							isCumulative: false,
							toolTip: 'Cumulative Group By'
						},
						{
							isCumulative: true,
							toolTip: 'Non Cumulative Group By '
						}
					];
					$scope.cumulativeToggle = ($scope.chartConfig.cumulative) ? $scope.cumulativeToggleStates[1] : $scope.cumulativeToggleStates[0];
					$scope.toggleCumulative = function () {
						$scope.cumulativeToggle = (!$scope.cumulativeToggle.isCumulative)? $scope.cumulativeToggleStates[1] : $scope.cumulativeToggleStates[0];

						// $scope.chartConfig.cumulative = (!$scope.cumulativeToggle.isCumulative) ? 0 : 1;
						(!$scope.cumulativeToggle.isCumulative) ? $scope.burnDownChartConfigInstance.cumulativeGroupBy(0) : $scope.burnDownChartConfigInstance.cumulativeGroupBy(1);
					};

					/**************************************************
					 * Construct pie charts
					 **************************************************/
					var _sortBy = function (itemGroups, targets, config) {
						// var groupByOrderFn = config.getGroupByOrder(groupByKey);
						// console.log("sorting item groups");
						var sortedItemGroups = _.sortBy(
							itemGroups,
							function (itemGroup) {
								var order = 0;
								angular.forEach(targets, function(groupByKey, index) {
									var groupByOrderFn = config.getGroupByOrder(groupByKey);
									order += (groupByOrderFn(itemGroup.values[0]) || 0) * Math.pow(10, targets.length - index - 1);
								});
								// console.log("order is: " + order);
								return order;
								// return groupByOrderFn(itemGroup.values[0]);
							}
						);
						return sortedItemGroups;
					};

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

						// mutually exclusive groupBy
						var summarizedItemGroups = {};
						if( config.cumulativeGroupBy() ){
							var targets = [];
							angular.forEach(groupByAttrs, function(groupByKey) {

								// itemGroup.summary[groupByKey] = itemGroup.key;
								targets.push(groupByKey);
								// console.log("targets are");
								// console.log(targets.toString());
								var itemGroups = groupByFlatFilter(items, targets);
								_summarizeItemGroups(itemGroups, config, groupByKey);
								// console.log("itemgroups after summarize");
								// console.log(itemGroups);

								var sortedItemGroups = _sortBy(itemGroups, targets, config);
								summarizedItemGroups[targets.join("::")] = sortedItemGroups;

							});
						}
						else {
							angular.forEach(groupByAttrs, function(groupByKey) {

								// itemGroup.summary[groupByKey] = itemGroup.key;
								var itemGroups = groupByFlatFilter(items, groupByKey);
								_summarizeItemGroups(itemGroups, config, groupByKey);
								// console.log("itemgroups after summarize");
								// console.log(itemGroups);
								// summarizedItemGroups[groupByKey] = itemGroups;

								var sortedItemGroups = _sortBy(itemGroups, [groupByKey], config);
								summarizedItemGroups[groupByKey] = sortedItemGroups;

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

					};

					var getSeriesColors = function (itemGroups) {
						return _.map(itemGroups, function (itemGroup) {
								   return itemGroup.summary.color;
							   });
					};

					var getBurnDownChartDataSources = function (config) {
						var burnDownChartDataSource = {};
						var groupByAttrs = config.getGroupByAttributes();
						var summaryAttrs = config.getSummaryAttributes();
						if( config.getCount() ){
							summaryAttrs.unshift('count');
						}

						if( config.cumulativeGroupBy() ){
							angular.forEach(summaryAttrs, function(summaryAttr) {
								burnDownChartDataSource[summaryAttr] = burnDownChartDataSource[summaryAttr] || {};
								var targets = [];
								angular.forEach(groupByAttrs, function(groupByAttr) {
									targets.push(groupByAttr);
									// burnDownChartDataSource[summaryAttr][groupByAttr] = function (itemGroups) {
									burnDownChartDataSource[summaryAttr][targets.join("::")] = function (itemGroups) {
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
								burnDownChartDataSource[groupByAttr] = burnDownChartDataSource[groupByAttr] || {};
								angular.forEach(summaryAttrs, function(summaryAttr) {
									burnDownChartDataSource[groupByAttr][summaryAttr] = function (itemGroups) {
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

						return burnDownChartDataSource;
					};

					$scope.burnDownCharts = [];
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

					var getBurnDownCharts = function (items, config) {
						// var groupByColumns = config.getGroupByColumns();
						// var itemGroups = groupByFilter(items, groupByColumns);
						// config = new burnDownChartConfig(config);
						// console.log("config blessed is ");
						// console.log(config);

						var summarizedItemGroups = summarizePieData(items, config);
						// console.log("sorted item status grousp");
						// console.log(summarizedItemGroups);

						$scope.burnDownCharts = [];
						var burnDownChartDataSource = getBurnDownChartDataSources(config);

						// >>> flip summary and groupby
						if( config.cumulativeGroupBy() ){
							// angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
							var groupByAttrs = config.getGroupByAttributes();
							var groupByAttrsPretty = config.getGroupByAttributesPretty();
							angular.forEach(burnDownChartDataSource, function(burnDownChartDataSources, summaryKey) {
								if( config.collapseCharts() ){
									var burnDownChart = {};
									burnDownChart.options = _.clone($scope.defaultDonutOptions);
									burnDownChart.data = [];
									burnDownChart.options.series = [];

									// var summarySpec = config.lookUpSummarySpec(summaryKey);
									// burnDownChart.options.title = [summarySpec.prettyName, summarySpec.prettyNameSuffix, config.getTitle()].join(" ");
									// // burnDownChart.options.title += " grouped by " + groupByAttrsPretty.join(", ") + " (in order from outer ring to inner) ";
									// burnDownChart.options.title += " grouped by " + groupByAttrsPretty.slice(0,-1).join(", ") + " and " + groupByAttrsPretty.slice(-1)[0];

									burnDownChart.options.title = config.getChartTitleCumulative(summaryKey);

									angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
										// console.log("groupByKey");
										// console.log(groupByKey);
										burnDownChart.data.push(burnDownChartDataSources[groupByKey](itemGroups));
										burnDownChart.options.series.push({
											label: groupByKey,
											seriesColors: getSeriesColors(itemGroups)
											// legend: $scope.defaultDonutOptions.legend
										});
									});
									// burnDownChart.data.reverse();
									// burnDownChart.options.series.reverse();

									$scope.burnDownCharts.push(burnDownChart);
								}
								else {
									angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
										// angular.forEach(burnDownChartDataSource, function(burnDownChartDataSourceFn, groupByKey) {
										if( groupByAttrs.join("::") ===  groupByKey){
											var burnDownChart = {};
											// console.log("groupByKey");
											// console.log(groupByKey);
											// burnDownChart.data = [burnDownChartDataSource[groupByKey](itemGroups)];
											burnDownChart.data = [burnDownChartDataSources[groupByKey](itemGroups)];
											burnDownChart.options = _.clone($scope.defaultPieOptions);
											// burnDownChart.options.title = config.getTitle();
											burnDownChart.options.title = config.getChartTitleCumulative(summaryKey);
											// burnDownChart.options.seriesColors = getSeriesColors(itemGroups);
											$scope.burnDownCharts.push(burnDownChart);
										}
									});
								}
							});

						}
						else {
							angular.forEach(summarizedItemGroups, function(itemGroups, groupByKey) {
								if( config.collapseCharts() ){
									var burnDownChart = {};
									burnDownChart.options = _.clone($scope.defaultDonutOptions);
									burnDownChart.data = [];
									// burnDownChart.options.seriesColors = [];
									burnDownChart.options.seriesColors = getSeriesColors(itemGroups);
									burnDownChart.options.title = config.getChartTitle(groupByKey);
									// angular.forEach(_.keys(burnDownChartDataSource), function(summaryKey) {
									angular.forEach(burnDownChartDataSource[groupByKey], function(burnDownChartDataSourceFn, summaryKey) {
										// angular.forEach(burnDownChartDataSource, function(burnDownChartDataSourceFn, summaryKey) {
										// console.log("summary key");
										// console.log(summaryKey);
										// burnDownChart.data = [burnDownChartDataSource[summaryKey](itemGroups)];
										burnDownChart.data.push(burnDownChartDataSourceFn(itemGroups));
										// burnDownChart.options.seriesColors.push(getSeriesColors(itemGroups));
									});
									$scope.burnDownCharts.push(burnDownChart);
								}
								else {
									// angular.forEach(_.keys(burnDownChartDataSource), function(summaryKey) {
									angular.forEach(burnDownChartDataSource[groupByKey], function(burnDownChartDataSourceFn, summaryKey) {
										// angular.forEach(burnDownChartDataSource, function(burnDownChartDataSourceFn, summaryKey) {
										var burnDownChart = {};
										// console.log("summary key");
										// console.log(summaryKey);
										// burnDownChart.data = [burnDownChartDataSource[summaryKey](itemGroups)];
										burnDownChart.data = [burnDownChartDataSourceFn(itemGroups)];
										burnDownChart.options = _.clone($scope.defaultPieOptions);
										burnDownChart.options.title = config.getChartTitle(groupByKey, summaryKey);
										burnDownChart.options.seriesColors = getSeriesColors(itemGroups);
										$scope.burnDownCharts.push(burnDownChart);
									});
								}
							});

						}

						console.log("pie charts");
						console.log($scope.burnDownCharts);
					};

					if( $scope.items.length ){
						// getBurnDownCharts($scope.items, $scope.chartConfig);
						getBurnDownCharts($scope.items, $scope.burnDownChartConfigInstance);
					}

					$scope.$watchCollection('items', function (newObj, oldObj) {
						if( !angular.equals(newObj, oldObj) ){
							// getBurnDownCharts($scope.items, $scope.chartConfig);
							getBurnDownCharts($scope.items, $scope.burnDownChartConfigInstance);
						}
					});

					// $scope.$watchCollection('chartConfig', function (newObj, oldObj) {
					// 	if( !angular.equals(newObj, oldObj) ){
					// 		$scope.burnDownChartConfigInstance = new burnDownChartConfig($scope.chartConfig);
					// 		getBurnDownCharts($scope.items, $scope.burnDownChartConfigInstance);
					// 	}
					// });

					// $scope.$watchCollection('burnDownChartConfigInstance', function (newObj, oldObj) {
					// 	if( !angular.equals(newObj, oldObj) ){
					// 		// $scope.burnDownChartConfigInstance = new burnDownChartConfig($scope.chartConfig);
					// 		getBurnDownCharts($scope.items, $scope.burnDownChartConfigInstance);
					// 	}
					// });

					$scope.$watch('burnDownChartConfigInstance', function (newObj, oldObj) {
						if( !angular.equals(newObj, oldObj) ){
							// $scope.burnDownChartConfigInstance = new burnDownChartConfig($scope.chartConfig);
							getBurnDownCharts($scope.items, $scope.burnDownChartConfigInstance);
						}
					}, true);

					// $scope.$watchGroup(['items', 'chartConfig'], function (newValues, oldValues) {
					// 	// getBurnDownCharts($scope.items, $scope.chartConfig);
					// 	if( !angular.equals(newValues, oldValues) ){
					// 		console.log("something changed");
					// 		getBurnDownCharts($scope.items, $scope.chartConfig);
					// 	}
					// });

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

						// seriesColors:['#85802b', '#00749F', '#73C774', '#C7754C', '#17BDB8', '#C7754C'],
						// seriesDefaults:{
						// 	shadow: false,
						// 	renderer: jQuery.jqplot.PieRenderer,
						// 	// trendline:{ show:false },
						// 	rendererOptions: {
						// 		padding: 8,
						// 		showDataLabels: true,
						// 		sliceMargin: 5,
						// 		// highlight not working !!!
						// 		highlightMouseOver: true,
						// 		startAngle: 270
						// 	}
						// },
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

					$scope.burnDownChart = {
						data: [$scope.chartData],
						options: $scope.defaultBurnDownOptions
					};
				}

			]
		};
	}
]);
