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
  				// resourceConfig: '=',
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

					// Enable/Disable attributes
					pieChartConfig.toggleAttr = function (attrSpec) {
						attrSpec.disabled = !attrSpec.disabled;
					};

					pieChartConfig.isDisabledAttr = function (attrSpec) {
						return attrSpec.disabled || false;
					};

					// Fetch attributes specs or specific keys in the attribute specs
					pieChartConfig.getAttributes = function (attrSpecs, options, attrKey) {
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
									return !pieChartConfig.isDisabledAttr(attrSpec);
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

					pieChartConfig.getAttributeKeys = function (attrSpecs, options) {
						// return pieChartConfig.getAttributes(attrSpecs, 'key', 'ordering');
						// return pieChartConfig.getAttributes(attrSpecs, 'key', options);
						return pieChartConfig.getAttributes(attrSpecs, options, 'key');
					};

					pieChartConfig.getAttributeDisplayNames = function (attrSpecs, options) {
						// return pieChartConfig.getAttributes(attrSpecs, 'prettyName', 'ordering');
						// return pieChartConfig.getAttributes(attrSpecs, 'prettyName', options);
						return pieChartConfig.getAttributes(attrSpecs, options, 'prettyName');
					};

					pieChartConfig.prototype.getGroupByAttributeSpecs = function (options) {
						// return pieChartConfig.getAttributes(this.groupBy);
						var that = this;
						return pieChartConfig.getAttributes(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));

						// if( _.isArray(customOrder) ){
						// 	return pieChartConfig.getAttributes(that.groupBy, {
						// 		customOrder: customOrder,
						// 		// customOrder: ['type', 'status'],
						// 		// customOrder: ['status', 'type'],
						// 		dictionary: that.groupByDictionary
						// 	});
						// }
						// else {
						// 	return pieChartConfig.getAttributes(that.groupBy, {
						// 		orderingKey: 'ordering'
						// 	});
						// }
					};

					pieChartConfig.prototype.getGroupByAttributes = function (options) {
						var that = this;
						return pieChartConfig.getAttributeKeys(that.groupBy, angular.extend({}, options, {
							dictionary: that.groupByDictionary,
							orderingKey: 'ordering'
						}));
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

					pieChartConfig.prototype.getSummaryAttributeSpecs = function (options) {
						var that = this;
						return pieChartConfig.getAttributes(that.summary, angular.extend({}, options, {
							dictionary: that.summaryItemsDictionary,
							orderingKey: 'ordering'
						}));
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

					pieChartConfig.prototype.getGroupByOrder = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return (!angular.isDefined(groupBySpec) || !angular.isDefined(groupBySpec.groupByOrder))? angular.noop : groupBySpec.groupByOrder;
					};

					/**************************************************
					 * Enable/Disable groupBy attributes
					 **************************************************/
					pieChartConfig.prototype.toggleGroupBy = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						pieChartConfig.toggleAttr(groupBySpec);
					};

					pieChartConfig.prototype.isDisabledGroupBy = function (groupByKey) {
						var groupBySpec = this.groupByDictionary.lookUpItem(groupByKey);
						return pieChartConfig.isDisabledAttr(groupBySpec);
					};

					/**************************************************
					 * Enable/Disable summaryItem attributes
					 **************************************************/
					pieChartConfig.prototype.toggleSummaryItem = function (summaryItemKey) {
						var summaryItemSpec = this.summaryItemsDictionary.lookUpItem(summaryItemKey);
						pieChartConfig.toggleAttr(summaryItemSpec);
					};

					pieChartConfig.prototype.isDisabledSummaryItem = function (summaryItemKey) {
						var summaryItemSpec = this.summaryItemsDictionary.lookUpItem(summaryItemKey);
						return pieChartConfig.isDisabledAttr(summaryItemSpec);
					};

					/**************************************************
					 * More helpers ...
					 **************************************************/

					pieChartConfig.prototype.getCount = function () {
						return this.count;
					};

					pieChartConfig.prototype.collapseCharts = function (setCollapse) {
						if( angular.isDefined(setCollapse) ){
							this.collapse = setCollapse;
						}
						return this.collapse;
					};

					pieChartConfig.prototype.cumulativeGroupBy = function (setCumulative) {
						if( angular.isDefined(setCumulative) ){
							this.cumulative = setCumulative;
						}
						return this.cumulative;
					};

					pieChartConfig.prototype.getTitle = function () {
						return this.title;
					};

					pieChartConfig.prototype.getChartTitle = function (groupByKey, summaryKey) {
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

					pieChartConfig.prototype.getChartTitleCumulative = function (summaryKey) {
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

					$scope.pieChartConfigInstance = new pieChartConfig($scope.chartConfig);

					/**************************************************
					 * GroupBy dropdown helpers
					 **************************************************/
					$scope.getGroupBySpecs = function () {
						return $scope.pieChartConfigInstance.getGroupByAttributeSpecs({
							allowDisabled: true
						});
					};

					$scope.isActiveGroupBy = function (groupByKey) {
						return !$scope.pieChartConfigInstance.isDisabledGroupBy(groupByKey);
					};

					$scope.toggleGroupBy = function (groupByKey) {
						$scope.pieChartConfigInstance.toggleGroupBy(groupByKey);
						// console.log("toggled groupby");
						// console.log($scope.pieChartConfigInstance);
					};


					/**************************************************
					 * Summary items dropdown helpers
					 **************************************************/
					$scope.getSummaryItemsSpecs = function () {
						return $scope.pieChartConfigInstance.getSummaryAttributeSpecs({
							allowDisabled: true
						});
					};

					$scope.isActiveSummaryItem = function (summaryItemKey) {
						return !$scope.pieChartConfigInstance.isDisabledSummaryItem(summaryItemKey);
					};

					$scope.toggleSummaryItem = function (summaryItemKey) {
						$scope.pieChartConfigInstance.toggleSummaryItem(summaryItemKey);
						// console.log("toggled summaryItem");
						// console.log($scope.pieChartConfigInstance);
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
						(!$scope.donutToggle.isDonut) ? $scope.pieChartConfigInstance.collapseCharts(0) : $scope.pieChartConfigInstance.collapseCharts(1);
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
						(!$scope.cumulativeToggle.isCumulative) ? $scope.pieChartConfigInstance.cumulativeGroupBy(0) : $scope.pieChartConfigInstance.cumulativeGroupBy(1);
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
						// config = new pieChartConfig(config);
						// console.log("config blessed is ");
						// console.log(config);

						var summarizedItemGroups = summarizePieData(items, config);
						// console.log("sorted item status grousp");
						// console.log(summarizedItemGroups);

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
										// console.log("groupByKey");
										// console.log(groupByKey);
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
											// console.log("groupByKey");
											// console.log(groupByKey);
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
									pieChart.options.title = config.getChartTitle(groupByKey);
									// angular.forEach(_.keys(pieChartDataSource), function(summaryKey) {
									angular.forEach(pieChartDataSource[groupByKey], function(pieChartDataSourceFn, summaryKey) {
										// angular.forEach(pieChartDataSource, function(pieChartDataSourceFn, summaryKey) {
										// console.log("summary key");
										// console.log(summaryKey);
										// pieChart.data = [pieChartDataSource[summaryKey](itemGroups)];
										pieChart.data.push(pieChartDataSourceFn(itemGroups));
										// pieChart.options.seriesColors.push(getSeriesColors(itemGroups));
									});
									$scope.pieCharts.push(pieChart);
								}
								else {
									// angular.forEach(_.keys(pieChartDataSource), function(summaryKey) {
									angular.forEach(pieChartDataSource[groupByKey], function(pieChartDataSourceFn, summaryKey) {
										// angular.forEach(pieChartDataSource, function(pieChartDataSourceFn, summaryKey) {
										var pieChart = {};
										// console.log("summary key");
										// console.log(summaryKey);
										// pieChart.data = [pieChartDataSource[summaryKey](itemGroups)];
										pieChart.data = [pieChartDataSourceFn(itemGroups)];
										pieChart.options = _.clone($scope.defaultPieOptions);
										pieChart.options.title = config.getChartTitle(groupByKey, summaryKey);
										pieChart.options.seriesColors = getSeriesColors(itemGroups);
										$scope.pieCharts.push(pieChart);
									});
								}
							});

						}

						console.log("pie charts");
						console.log($scope.pieCharts);
					};

					if( $scope.items.length ){
						// getPieCharts($scope.items, $scope.chartConfig);
						getPieCharts($scope.items, $scope.pieChartConfigInstance);
					}

					$scope.$watchCollection('items', function (newObj, oldObj) {
						if( !angular.equals(newObj, oldObj) ){
							// getPieCharts($scope.items, $scope.chartConfig);
							getPieCharts($scope.items, $scope.pieChartConfigInstance);
						}
					});

					// $scope.$watchCollection('chartConfig', function (newObj, oldObj) {
					// 	if( !angular.equals(newObj, oldObj) ){
					// 		$scope.pieChartConfigInstance = new pieChartConfig($scope.chartConfig);
					// 		getPieCharts($scope.items, $scope.pieChartConfigInstance);
					// 	}
					// });

					// $scope.$watchCollection('pieChartConfigInstance', function (newObj, oldObj) {
					// 	if( !angular.equals(newObj, oldObj) ){
					// 		// $scope.pieChartConfigInstance = new pieChartConfig($scope.chartConfig);
					// 		getPieCharts($scope.items, $scope.pieChartConfigInstance);
					// 	}
					// });

					$scope.$watch('pieChartConfigInstance', function (newObj, oldObj) {
						if( !angular.equals(newObj, oldObj) ){
							// $scope.pieChartConfigInstance = new pieChartConfig($scope.chartConfig);
							getPieCharts($scope.items, $scope.pieChartConfigInstance);
						}
					}, true);

					// $scope.$watchGroup(['items', 'chartConfig'], function (newValues, oldValues) {
					// 	// getPieCharts($scope.items, $scope.chartConfig);
					// 	if( !angular.equals(newValues, oldValues) ){
					// 		console.log("something changed");
					// 		getPieCharts($scope.items, $scope.chartConfig);
					// 	}
					// });

				}
			]
		};
	}
]);
