angular.module('directives.tableactive', [
	'directives.actionicon',
	'directives.propertybar',
	'directives.treeNode',
	'directives.treeView',
	'directives.ngTree',
	'ui.bootstrap',
	'filters.pagination',
	'underscore'
])

// A directive to display a paginated, searchable and sortable table
// give the list of items, items per page, and resource name
.directive('tableactive', [
	'paginationFilter',
	'dateFilter',
	'_',
	function(
		paginationFilter,
		dateFilter,
		_
	) {
		return {
			restrict: 'E',
			templateUrl: 'directives/tableactive.tpl.html',
			// template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
			replace: true,
			scope: {
				resourceconf: '=',
				items: '=',
				fetchingitems: '=?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'dateFilter',
				'$interpolate',
				'$filter',
				function ($scope, $element, $attrs, dateFilter, $interpolate, $filter) {
					console.log("LINKING THE TABLEACTIVE!!!!");
					var conf = $scope.resourceconf;
					// $scope.currentPage = (conf.pagination)? conf.pagination.currentPage : 1;
					// $scope.itemsPerPage = (conf.pagination)? conf.pagination.itemsPerPage : 20;
					$scope.currentPage = conf.pagination.currentPage || 1;
					$scope.itemsPerPage = conf.pagination.itemsPerPage || 20;
					$scope.itemsCrudHelpers = conf.resource.itemsCrudHelpers;

					$scope.rootDivClass = conf.resource.rootDivClass;
					$scope.manageResources = conf.resource.link;
					$scope.resourcePrettyName = conf.resource.prettyName;
					$scope.resourcePrettyNameAlt = conf.resource.altPrettyName;

					/**************************************************
					 * Search Field
					 **************************************************/
					$scope.getItemId = function (item) {
						return item.$id();
					};

					// $scope.searchByField = conf.searchinit.fieldKey;
					$scope.itemIDField = {
						key: '$id',
						keyfn : $scope.getItemId,
						type: 'item-id',
						prettyName : 'ID',
						widthClass : 'col-md-1'
						// icon : 'font'
					};

					$scope.searchByField = (conf.searchinit)? conf.searchinit.field : {};
					$scope.selectSearchField = function (selectedField) {
						$scope.searchByField = selectedField;
					};

					$scope.getSearchFields = function (allFields) {
						return _.chain(allFields).filter(function (field) {
							return !field.skipSearch;
						}).value();
					};

					$scope.isActiveSearchField = function (key) {
						return (key === $scope.searchByField.key);
					};

					$scope.searchBy = function (searchByField, query) {
						var queryObject;
						if( searchByField.type === 'item-id' ){
							queryObject = function (item) {
								if( query ){
									return (searchByField.keyfn(item) === query);
								}
								return true;
							};
						}
						else {
							queryObject = {};
							queryObject[searchByField.key] = query;
						}
						return queryObject;
					};

					/**************************************************
					 * Item Sort
					 **************************************************/
					$scope.itemsSort = {
						// sortField : conf.sortinit.fieldKey,
						// sortFieldorFn : conf.sortinit.fieldKeyFn || conf.sortinit.fieldKey,
						// reverse : conf.sortinit.reverse,
						sort : function(fieldname) {
							if( this.sortField === fieldname){
								this.reverse = !this.reverse;
							}
							else {
								this.sortField = fieldname;
								this.sortFieldOrFn = (fieldname === '$id')? $scope.itemIDField.keyfn : fieldname;
								this.reverse = false;
							}
						},
						isSortDown : function(fieldname) {
							return (this.sortField === fieldname) && this.reverse;
						},
						isSortUp : function(fieldname) {
							return (this.sortField === fieldname) && !this.reverse;
						}
					};

					$scope.toggleReverseSort = function () {
						$scope.itemsSort.reverse = !$scope.itemsSort.reverse;
					};

					$scope.isActiveSortField = function (key) {
						return (key === $scope.itemsSort.sortField);
					};

					$scope.itemsSort.sort(conf.sortinit.fieldKey);

					// $scope._getActiveSortField = function (key, allFields) {
					// 	return _.filter(allFields, function (field) {
					// 		return (field.key === key);
					// 	});
					// };

					// $scope.getActiveSortField = function (key) {
					// 	return (key === '$id')? $scope.itemIDField : $scope._getActiveSortField(key, $scope.tableViewSpec.columns);
					// };

					$scope.getActiveSortField = function (key, allFields) {
						return (key === '$id')? $scope.itemIDField : _.chain(allFields).filter(function (field) {
							return (field.key === key);
						}).value()[0];
					};

					/**************************************************
					 * Table View
					 **************************************************/
					// $scope.tableColumns = conf.tableColumns;
					$scope.tableViewSpec = conf.tableViewSpec || {columns: conf.tableColumns};

					$scope.itemDescriptionSpecDefined = function (spec) {
						return !!spec.description;
					};

					$scope.getItemDescription = function (item, spec) {
						return (spec.description)? item[spec.description.key] : "";
					};

					$scope.getItemViewLink = function (item) {
						return $scope.itemsCrudHelpers.view(item.$id(), true);
					};

					/**************************************************
					 * MediaView toggle helpers
					 **************************************************/
					$scope.mediaViewToggleStates = [
						{
							isMediaView: false,
							toolTip: 'Thumbnail list view'
						},
						{
							isMediaView: true,
							toolTip: 'Tabular view'
						}
					];
					$scope.mediaViewToggle = $scope.mediaViewToggleStates[1];
					// $scope.mediaViewToggle = ($scope.conf.mediaView) ? $scope.mediaViewToggleStates[1] : $scope.mediaViewToggleStates[0];
					$scope.toggleMediaView = function () {
						$scope.mediaViewToggle = (!$scope.mediaViewToggle.isMediaView)? $scope.mediaViewToggleStates[1] : $scope.mediaViewToggleStates[0];
					};

					/**************************************************
					 * View Mode
					 **************************************************/
					$scope.viewModeMenu = {
						isOpen: false
					};

					$scope.viewModes = [
						{
							key: "table",
							prettyName: "Tablular view",
							icon: "th-list"
						}
						// {
						// 	key: "list",
						// 	prettyName: "List view",
						// 	icon: "align-justify"
						// },
						// {
						// 	key: "tree",
						// 	prettyName: "Tree view",
						// 	icon: "tree-conifer"
						// }
					];

					$scope.activeViewMode = {
						table: true,
						list: false,
						tree: false
					};

					$scope.selectViewMode = function (selectKey) {
						_.each($scope.activeViewMode, function (flag, key) {
							$scope.activeViewMode[key] = (selectKey === key)? true : false;
						});
					};

					if( conf.mediaViewSpec ){
						$scope.viewModes.push({
							key: "list",
							prettyName: "List view",
							icon: "align-justify"
						});
						$scope.selectViewMode('list');
					}

					if( conf.treeViewSpec ){
						$scope.viewModes.push({
							key: "tree",
							prettyName: "Tree view",
							icon: "tree-conifer"
						});
						$scope.selectViewMode('tree');
					}

					$scope.isActiveViewMode = function (key) {
						return $scope.activeViewMode[key];
					};

					/**************************************************
					 * Media View
					 **************************************************/

					$scope.mediaViewSpec = conf.mediaViewSpec;

					$scope.getMediaItemTitle = function (item) {
						return item[$scope.mediaViewSpec.title.key];
					};

					// $scope.itemDescriptionSpecDefined = function () {
					// 	return !!$scope.mediaViewSpec.description;
					// };

					// $scope.getMediaItemDescription = function (item) {
					// 	return ($scope.mediaViewSpec.description)? item[$scope.mediaViewSpec.description.key] : "";
					// };

					$scope.itemsProperties = {};
					$scope._getMediaProperties = function (item) {
						var itemId = item.$id();
						var itemProperties = {};
						angular.forEach($scope.mediaViewSpec.properties, function(propertySpec, index) {
							itemProperties[propertySpec.key] = {
								name: propertySpec.prettyName,
								value: (propertySpec.type === 'date')? dateFilter(item[propertySpec.key], 'shortDate') : item[propertySpec.key],
								// type: item[propertySpec.type],
								icon: propertySpec.icon,
								ordering: index  + 1
							};
						});
						return $scope.itemsProperties[itemId] = $scope.itemsProperties[itemId] || itemProperties;

						// return $scope.itemsProperties[itemId] = $scope.itemsProperties[itemId] || _.map(
						// 	$scope.mediaViewSpec.properties,
						// 	function (propertySpec, index) {
						// 		return {
						// 			name: propertySpec.prettyName,
						// 			value: (propertySpec.type === 'date')? dateFilter(item[propertySpec.key], 'shortDate') : item[propertySpec.key],
						// 			// type: item[propertySpec.type],
						// 			icon: propertySpec.icon,
						// 			ordering: index  + 1
						// 		};
						// 	}
						// );

						// return $scope.itemsProperties[itemId] = $scope.itemsProperties[itemId] || _.map(
						// 	$scope.mediaViewSpec.properties,
						// 	function (propertySpec, index) {
						// 		return {
						// 			name: propertySpec.prettyName,
						// 			value: (propertySpec.type === 'date')? dateFilter(item[propertySpec.key], 'shortDate') : item[propertySpec.key],
						// 			// type: item[propertySpec.type],
						// 			icon: propertySpec.icon,
						// 			ordering: index  + 1
						// 		};
						// 	}
						// );

						// return $scope.itemsProperties[itemId];
						// var properties = _.map(
						// 	$scope.mediaViewSpec.properties,
						// 	function (propertySpec, index) {
						// 		return {
						// 			name: propertySpec.prettyName,
						// 			value: item[propertySpec.key],
						// 			icon: propertySpec.icon,
						// 			ordering: index  + 1
						// 		};
						// 	}
						// );
						// return properties

					};

					$scope.getSortByProperties = function (item, sortField) {
						// console.log("ssssssssssssssssssssssssssssssssssssssssssssssssss");
						// console.log(_.chain($scope._getMediaProperties(item)).pick(sortField).values().value());
						return _.chain($scope._getMediaProperties(item)).pick(sortField).values().value();
					};

					$scope.getOtherProperties = function (item, sortField) {
						return _.chain($scope._getMediaProperties(item)).omit(sortField).values().value();
					};

					$scope.getMediaItemLabels = function (item) {
						// var labelTemplate = '<span class="badge">{{name}}: {{value}}</span>';
						var labelTemplate = '<span title="{{name}}" class="label label-{{bclass}}">{{value}}</span>';
						var labelFn = $interpolate(labelTemplate);
						return _.chain($scope.mediaViewSpec.labels).map(
							function (labelSpec) {
								return labelFn({
									name: labelSpec.prettyName,
									value: item[labelSpec.key],
									bclass: labelSpec.bclass
								});
							}
						).value().join("");
					};

					/**************************************************
					 * Tree view
					 **************************************************/
					$scope.treeViewSpec = conf.treeViewSpec;

					$scope.getNodeHeading = function (item) {
						return item[$scope.treeViewSpec.title.key];
					};

					$scope.getTreeNodeLabels = function (item) {
						// var labelTemplate = '<span class="badge">{{name}}: {{value}}</span>';
						var labelTemplate = '<span title="{{name}}" class="label label-{{bclass}} property-label">{{value}}</span>';
						var labelTemplateWithIcon = '<span title="{{name}}" class="label label-{{bclass}} property-label"><span class="glyphicon glyphicon-{{icon}}"></span> {{value}}</span>';
						var labelFn = $interpolate(labelTemplate);
						var labelWithIconFn = $interpolate(labelTemplateWithIcon);

						return _.chain($scope.treeViewSpec.labels).map(
							function (labelSpec) {
								return (labelSpec.icon)? labelWithIconFn({
									name: labelSpec.prettyName,
									value: (labelSpec.type === 'date')? dateFilter(item[labelSpec.key], 'mediumDate') : item[labelSpec.key],
									bclass: labelSpec.bclass,
									icon: labelSpec.icon
								}) : labelFn({
									name: labelSpec.prettyName,
									value: (labelSpec.type === 'date')? dateFilter(item[labelSpec.key], 'mediumDate') : item[labelSpec.key],
									bclass: labelSpec.bclass,
									icon: labelSpec.icon
								});
							}
						).value().join("&nbsp;");
					};

					// $scope.getMediaProperties = function (item) {
					// 	var itemId = item.$id();
					// 	return $scope.itemsProperties[itemId] = $scope.itemsProperties[itemId] || _.map(
					// 		$scope.mediaViewSpec.properties,
					// 		function (propertySpec, index) {
					// 			return {
					// 				name: propertySpec.prettyName,
					// 				value: (propertySpec.type === 'date')? dateFilter(item[propertySpec.key], 'shortDate') : item[propertySpec.key],
					// 				// type: item[propertySpec.type],
					// 				icon: propertySpec.icon,
					// 				ordering: index  + 1
					// 			};
					// 		}
					// 	);
					// };

					// $scope.getSortByProperty  = function (item, sortField) {
					// 	return _.filter($scope.getMediaProperties(item),function (itemProperty) {
					// 			   return itemProperty.name
					// 		   });
					// };

					// $scope.getOtherProperties  = function () {

					// };

					// $scope.$watchCollection('items', function (newItems, oldItems) {
					// 	if( !angular.equals(newItems, oldItems) ){
					// 		angular.forEach(newItems, function(item, index) {
					// 			var itemId = item.$id();
					// 			$scope.itemProperties[itemId] = $scope.itemProperties[itemId] || $scope.getMediaProperties(item);
					// 		});
					// 	}
					// });

					// $scope.treedata = [
					// 	{ "label" : "User", "id" : "role1", "children" : [
					// 		{ "label" : "subUser1", "id" : "role11", "children" : [] },
					// 		{ "label" : "subUser2", "id" : "role12", "children" : [
					// 			{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 				{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 				{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 					{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 						{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 						{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 							{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 								{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 								{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 									{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 										{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 										{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 											{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 												{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 												{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 													{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 														{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 														{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 															{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 																{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 																{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 																	{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 																		{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 																		{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [{ "label" : "subUser2", "id" : "role12", "children" : [
					// 																			{ "label" : "subUser2-1", "id" : "role121", "children" : [
					// 																				{ "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
					// 																				{ "label" : "subUser2-1-2", "id" : "role1212", "children" : [] }
					// 																			]}
					// 																		]}] }
					// 																	]}
					// 																]}] }
					// 															]}
					// 														]}] }
					// 													]}
					// 												]}] }
					// 											]}
					// 										]}] }
					// 									]}
					// 								]}] }
					// 							]}
					// 						]}] }
					// 					]}
					// 				]}] }
					// 			]}
					// 		]}
					// 	]},
					// 	{ "label" : "Admin", "id" : "role2", "children" : [] },
					// 	{ "label" : "Guest", "id" : "role3", "children" : [] }
					// ];

					// $scope.treedatalist = [
					// 	// { id: 1, "label" : "User", "id" : "role1", "parent" : null},
					// 	// { id: 2, "label" : "subUser1", "id" : "role11", "parent" : 1 },
					// 	// { id: 3, "label" : "subUser2", "id" : "role12", "parent" : 1},
					// 	// { id: 4, "label" : "subUser2-1", "id" : "role121", "parent" : 3},
					// 	// { id: 5, "label" : "subUser2-1-1", "id" : "role1211", "parent": 4 },
					// 	// { id: 6, "label" : "subUser2-1-2", "id" : "role1212", "parent": 4 },
					// 	// { id: 7,  "label" : "Admin", "id" : "role2", "parent" : null },
					// 	// { id: 8, "label" : "Guest", "id" : "role3", "parent" : null }
					// 	{"label" : "User", "id" : "role1", "parent" : null},
					// 	{"label" : "subUser1", "id" : "role11", "parent" : "role1" },
					// 	{"label" : "subUser2", "id" : "role12", "parent" : "role1"},
					// 	{"label" : "subUser2-1", "id" : "role121", "parent" : "role12"},
					// 	{"label" : "subUser2-1-1", "id" : "role1211", "parent": "role121" },
					// 	{"label" : "subUser2-1-2", "id" : "role1212", "parent": "role121" },
					// 	{"label" : "Admin", "id" : "role2", "parent" : null },
					// 	{"label" : "Guest", "id" : "role3", "parent" : null }
					// ];


					// $scope.getNodeId = function (node) {
					// 	return node.id;
					// };

					// $scope.getNodeParentId = function (node) {
					// 	return node.parent;
					// };

					// $scope.nodeLabel = function (node) {
					// 	return node.label;
					// };

					// $scope.nodeBody = function (node) {
					// 	return node.id;
					// };

					/**************************************************
					 * Items tree
					 **************************************************/
					var getRandomInt = function (min, max) {
						return Math.floor(Math.random() * (max - min)) + min;
					}

					$scope.nodeLookUp = {};
					$scope.childrenLookUp = {};
					$scope.descendentsLookUp = {};
					$scope.showChildrenLookUp = {};
					$scope.showDescendentsLookUp = {};
					$scope.filteredNodesLookUp = {};
 					$scope.filteredTopLevelNodes = {};

					$scope.getNodeId = function (node) {
						return node.$id();
						// return $scope.nodeIdFn({node: node});
					};

					$scope.getNodeParentId = function (node) {
						if( $scope.treeViewSpec.getNodeParentIdFn ){
							return $scope.treeViewSpec.getNodeParentIdFn(node);
						}
						else {
							return node.parent;
							// return $scope.nodeParentIdFn({node: node});
						}
					};

					$scope._getNodeParent = function (node, getNodeParentIdFn) {
						var parentNodeId = getNodeParentIdFn(node);
 						return (parentNodeId)? $scope.nodeLookUp[parentNodeId] : null;
						// return $scope.nodeLookUp[getNodeParentIdFn(node)] || null;
					};

					$scope.getNodeParent = function (node) {
						return $scope._getNodeParent(node, $scope.getNodeParentId);
					};

					$scope._getNodeSiblings = function (node, getNodeParentIdFn, getNodeIdFn) {
						// return (getNodeParentIdFn(node))? $scope.childrenLookUp[getNodeParentIdFn(node)] : null;
						var parentNodeId = getNodeParentIdFn(node);
						parentNodeId = parentNodeId || "_null_";
						if( parentNodeId === getNodeIdFn(node) ){
							console.log("Alert!!! : The node is self referencing itself as the parent. Setting it as a top level node");
							console.log(node);
							parentNodeId = "_null_";
						}

						$scope.childrenLookUp[parentNodeId] = $scope.childrenLookUp[parentNodeId] || [];
						return $scope.childrenLookUp[parentNodeId];

						// if( parentNodeId ){
						// 	$scope.childrenLookUp[parentNodeId] = $scope.childrenLookUp[parentNodeId] || [];
						// 	return $scope.childrenLookUp[parentNodeId];
						// }
						// else {
						// 	return null;
						// }
					};

					$scope.getNodeSiblings = function (node) {
						return $scope._getNodeSiblings(node, $scope.getNodeParentId, $scope.getNodeId);
					};

					$scope._getNodeChildren = function (node, getNodeIdFn) {
						return $scope.childrenLookUp[getNodeIdFn(node)];
					};

					$scope.getNodeChildren = function (node) {
						return $scope._getNodeChildren(node, $scope.getNodeId);
					};

					$scope.nodeHasChildren = function (node) {
						var children = $scope.getNodeChildren(node);
						return (children && children.length > 0);
 						// return ($scope.getNodeChildren(node, getNodeIdFn).length > 0);
					};

					$scope.getNodeChildrenCount = function (node) {
						var children = $scope.getNodeChildren(node);
						return (children)? children.length : 0;
					};

					$scope.getNodeDescendents = function (node) {
						var descendents = $scope.descendentsLookUp[($scope.getNodeId(node))];
						if( !descendents ){
							descendents = [];
							// var toTraverse = $scope.getNodeChildren(node);
							// descendents = [].concat(toTraverse);
							// while( toTraverse.length > 0 ){
							// 	var currentNode = toTraverse.shift();
							// 	var currentNodeChildren = $scope.getNodeChildren(currentNode);
							// 	toTraverse = toTraverse.concat(currentNodeChildren);
							// 	descendents = descendents.concat(currentNodeChildren);
							// }

							// var children = $scope.getNodeChildren(node);
							// var i = -1, len = children.length;
							// for(; ++i < len;){
							// 	var currentNode = children[i];
							// 	var currentNodeDescendents = $scope.getNodeDescendents(currentNode);
							// 	descendents = descendents.concat(currentNodeDescendents);
							// }

							var children = $scope.getNodeChildren(node);
							if( children ){
								angular.forEach(children, function(child, index) {
									var childDescendents = $scope.getNodeDescendents(child);
									if( childDescendents ){
										descendents = descendents.concat(childDescendents);
									}
								});
								descendents = children.concat(descendents);
							}
							else {
								descendents = null;
							}
							$scope.descendentsLookUp[($scope.getNodeId(node))] = descendents;
						}
						return descendents;
					};

					$scope.getNodeDescendentsCount = function (node) {
						var descendents = $scope.getNodeDescendents(node);
						return (descendents)? descendents.length : 0;
					};

					$scope.topLevelNodes = [];
					// $scope.itemsRandomTree = function (items) {
					// 	$scope.sortedItems = _.sortBy(items, function (item) {
					// 						  return item.$id();
					// 					  });
					// 	console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");
					// 	console.log("sorted items are");
					// 	console.log($scope.sortedItems);
 					// 	angular.forEach($scope.sortedItems, function(item, index) {
					// 		// if (index === 0) {
					// 		// 	item.parent = null;
					// 		// 	$scope.topLevelNodes.push(item);
					// 		// 	return;
					// 		// }
					// 		var parentIndex = getRandomInt(0, index);
					// 		if( parentIndex > 0 && parentIndex < 5 ){
					// 			item.parent = null;
					// 			$scope.getNodeSiblings(item).push(item);
  					// 			// $scope.topLevelNodes.push(item);
					// 			return;
					// 		}
					// 		item.parent = $scope.sortedItems[parentIndex].$id();
					// 		$scope.getNodeSiblings(item).push(item);
					// 		return;
					// 	});
					// 	console.log("preprocessed random tree data");
					// 	console.log($scope.sortedItems);
					// };

					$scope.itemsRandomTree = function (items) {
						console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");
						console.log("sorted items are");
						console.log(items);
 						angular.forEach(items, function(item, index) {
							var parentIndex = getRandomInt(0, index);
							if( (parentIndex >= 0 && parentIndex < 5) || parentIndex === index){
								item.parent = null;
								return;
							}
							item.parent = items[parentIndex].$id();
							return;
						});
						console.log("preprocessed random tree data");
						console.log(items);
					};

					$scope.initSortedItems = function (items) {
						$scope.sortedItems = _.sortBy(items, function (item) {
							// return item.$id();
							return $scope.getNodeId(item);
						});
					};

					$scope.sortItems = function (items) {
						return _.sortBy(items, function (item) {
							// return item.$id();
							return $scope.getNodeId(item);
						});
					};

 					$scope.initNodeLookUp = function (items) {
						$scope.nodeLookUp = _.indexBy(items, function (node) {
							return $scope.getNodeId(node);
						});
					};

 					$scope.initFilteredTopLevelNodes = function (items) {
						$scope.filteredTopLevelNodes = _.indexBy(items, function (node) {
							return $scope.getNodeId(node);
						});
					};

					$scope.initChildrenLookUp = function (items) {
						angular.forEach(items, function(item, index) {
							$scope.getNodeSiblings(item).push(item);
 						});
					};

					$scope.initDescendentsLookUp = function () {
						$scope.descendentsLookUp = {};
					};


					$scope.initShowChildrenLookUp = function (items) {
						angular.forEach(items, function(item, index) {
							$scope.showChildrenLookUp[item.$id()] = false;
							$scope.showDescendentsLookUp[item.$id()] = false;
 						});
					};

					$scope.toggleChildren = function (item) {
						$scope.showChildrenLookUp[item.$id()] = !$scope.showChildrenLookUp[item.$id()];
					};

					$scope.toggleDescendents = function (item) {
						$scope.showDescendentsLookUp[item.$id()] = !$scope.showDescendentsLookUp[item.$id()];
						($scope.showDescendentsLookUp[item.$id()]) ? $scope.unhideNodeDescendents(item) : $scope.hideNodeDescendents(item);
					};

					$scope.showChildren = function (item) {
						return $scope.showChildrenLookUp[item.$id()];
					};

					$scope.showDescendents = function (item) {
						return $scope.showDescendentsLookUp[item.$id()];
					};

					$scope.hideAllDescendents = function (items) {
						angular.forEach(items, function(item, index) {
							$scope.showChildrenLookUp[item.$id()] = false;
							$scope.showDescendentsLookUp[item.$id()] = false;
 						});
					};

					$scope.hideNodeDescendents = function (node) {
						var descendents = $scope.getNodeDescendents(node);
						$scope.hideAllDescendents(descendents);
						// angular.forEach(descendents, function(item, index) {
						// 	$scope.showChildrenLookUp[item.$id()] = false;
						// 	$scope.showDescendentsLookUp[item.$id()] = false;
 						// });
						$scope.showChildrenLookUp[node.$id()] = false;
					};

					$scope.unhideAllDescendents = function (items) {
						angular.forEach(items, function(item, index) {
							$scope.showChildrenLookUp[item.$id()] = true;
							$scope.showDescendentsLookUp[item.$id()] = true;
 						});
					};

					$scope.unhideNodeDescendents = function (node) {
						var descendents = $scope.getNodeDescendents(node);
						$scope.unhideAllDescendents(descendents);
						// angular.forEach(descendents, function(item, index) {
						// 	$scope.showChildrenLookUp[item.$id()] = true;
						// 	$scope.showDescendentsLookUp[item.$id()] = true;
 						// });
						$scope.showChildrenLookUp[node.$id()] = true;
					};

					$scope.getTopLevelNodes = function () {
						return $scope.childrenLookUp["_null_"];
					};

					/**************************************************
					 * ExpandTree toggle helpers
					 **************************************************/
					$scope.expandTreeToggleStates = [
						{
							isExpandTree: false,
							toolTip: 'Expand all'
						},
						{
							isExpandTree: true,
							toolTip: 'Collapse all'
						}
					];
					$scope.expandTreeToggle = $scope.expandTreeToggleStates[0];
					// $scope.expandTreeToggle = ($scope.conf.expandTree) ? $scope.expandTreeToggleStates[1] : $scope.expandTreeToggleStates[0];
					$scope.toggleExpandTree = function () {
						$scope.expandTreeToggle = (!$scope.expandTreeToggle.isExpandTree)? $scope.expandTreeToggleStates[1] : $scope.expandTreeToggleStates[0];
						($scope.expandTreeToggle.isExpandTree)? $scope.unhideAllDescendents($scope.sortedItems) : $scope.hideAllDescendents($scope.sortedItems);

					};

					$scope.collapseTree = function () {
						$scope.expandTreeToggle = $scope.expandTreeToggleStates[0];
						$scope.hideAllDescendents($scope.sortedItems);
					};

					$scope.initTreeViewData = function (items) {
						if( $scope.treeViewSpec ){
							$scope.sortedItems = $scope.sortItems(items);
							$scope.initDescendentsLookUp($scope.sortedItems);
							// random tree generator !!! to be removed
							$scope.itemsRandomTree($scope.sortedItems);
							$scope.initNodeLookUp($scope.sortedItems);
							$scope.initChildrenLookUp($scope.sortedItems);
							$scope.initShowChildrenLookUp($scope.sortedItems);
							$scope.topLevelNodes = $scope.getTopLevelNodes();
							$scope.initFilteredTopLevelNodes($scope.topLevelNodes);
						}
					};

					$scope.initTreeViewData($scope.items);
					$scope.$watchCollection('items', function (newItems, oldItems) {
						if( !angular.equals(newItems, oldItems) ){
							$scope.initTreeViewData(newItems);

							// // $scope.initSortedItems(newItems);
							// $scope.sortedItems = $scope.sortItems(newItems);
							// $scope.initDescendentsLookUp($scope.sortedItems);
							// $scope.itemsRandomTree($scope.sortedItems);
							// $scope.initNodeLookUp($scope.sortedItems);
							// $scope.initChildrenLookUp($scope.sortedItems);
							// $scope.initShowChildrenLookUp($scope.sortedItems);
							// $scope.topLevelNodes = $scope.getTopLevelNodes();
							// $scope.initFilteredTopLevelNodes($scope.topLevelNodes);
						}
					});

					$scope.showAncestors = function (nodes) {
						var ancestors = {};
 						var filteredTopLevelNodes = {};
						angular.forEach(nodes, function(node) {
							var currentNode = node;
							var parentNode;
							var parentNodeId;
							while( currentNode ){
								// ancestors.push($scope.getNodeParent(currentNode));
								parentNode = $scope.getNodeParent(currentNode);
								if( parentNode ){
 									// console.log("expanding parent : " + $scope.getNodeId(parentNode));
									parentNodeId = $scope.getNodeId(parentNode);
									if( ancestors[parentNodeId] ){
										// if an ancestor is already seen
										// we dont need to go ahead
										break;
									}
									$scope.showChildrenLookUp[parentNodeId] = true;
									ancestors[parentNodeId] = parentNode;
								}
								else {
									// note this top level node
									filteredTopLevelNodes[$scope.getNodeId(currentNode)] = currentNode;
									// $scope.filteredTopLevelNodes[$scope.getNodeId(currentNode)] = currentNode;
								}
								currentNode = parentNode;
							}
							// return;
						});
						// set the filtered top level nodes
						$scope.filteredTopLevelNodes = filteredTopLevelNodes;
					};

					// $scope.showAncestors = function (node) {
					// 	if( !node ){
					// 		return;
					// 	}
					// 	var parentNode = $scope.getNodeParent(node);
					// 	// console.log("parent is : " + parentNode);
					// 	if( parentNode ){
					// 		// console.log("expanding parent : " + $scope.getNodeId(parentNode));
					// 		$scope.showChildrenLookUp[$scope.getNodeId(parentNode)] = true;
					// 		$scope.showAncestors(parentNode);
					// 	}
					// };

					// flags the filtered nodes
					// unhides the threads leading to the filtered nodes
					$scope.highlightFilteredNodes = function (filteredNodes) {
						console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
						console.log(filteredNodes);
						console.log("Node lookup is:");
						console.log($scope.nodeLookUp);
						console.log("Children lookup is:");
						console.log($scope.childrenLookUp);

						$scope.filteredNodesLookUp = _.indexBy(filteredNodes, function (node) {
							return $scope.getNodeId(node);
						});

						$scope.collapseTree();
						$scope.showAncestors(filteredNodes);
						// angular.forEach(filteredNodes, function(node) {
						// 	$scope.showAncestors(node);
						// });
 					};

 					$scope.isFilteredTreeNode = function (node) {
						return !!$scope.filteredNodesLookUp[$scope.getNodeId(node)];
					};

 					$scope.isFilteredTopLevelNode = function (node) {
						return !!$scope.filteredTopLevelNodes[$scope.getNodeId(node)];
					};

					// filter the nodes that match the query and set the
					// selection class
					$scope.queryFilterObject = {};
					$scope.$watch('query', function (newQuery, oldQuery) {
						if( newQuery !== oldQuery ){
							// $scope.queryFilterObject = {name: newQuery};
							$scope.queryFilterObject = $scope.searchBy($scope.searchByField, newQuery);

							var nameFilter = $filter('filter');
							$scope.filteredNodesLookUp = {};
							$scope.showChildrenLookUp = {};
							// $scope.topLevelNodes = $scope.getTopLevelNodes();
							// $scope.initFilteredTopLevelNodes($scope.topLevelNodes);
							if( newQuery ){
								// $scope.filteredTopLevelNodes = {};
								var filteredTreeNodes = nameFilter($scope.sortedItems, {name:newQuery});
								$scope.highlightFilteredNodes(filteredTreeNodes);
							}
							else {
								// $scope.initFilteredTopLevelNodes($scope.getTopLevelNodes());
								$scope.initFilteredTopLevelNodes($scope.topLevelNodes);
							}
						}
					});

					// $scope.getItemId = function (item) {
					// 	return item.$id();
					// };

					// $scope.getItemParentId = function (item) {
					// 	return item.parent;
					// };

					// $scope.itemLabel = function (item) {
					// 	return item.name;
					// };

					// $scope.itemBody = function (item) {
					// 	// return item.$id();
					// 	return item.description;
					// };
				}
			]
		};
	}
])
