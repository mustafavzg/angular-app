angular.module('directives.treeView', [
	// 'directives.actionicon',
	// 'directives.propertybar',
	'ui.bootstrap',
	// 'filters.pagination',
	'underscore'
])

// A tree View directive (implements an iterative approach)
.directive('treeView', [
	// 'paginationFilter',
	'dateFilter',
	'_',
	function(
		// paginationFilter,
		dateFilter,
		_
	) {
		return {
			restrict: 'E',
			templateUrl: 'directives/treeView.tpl.html',
			replace: true,
			scope: {
				nodes: '=',
				nodeLabel: '&',
				nodeBody: '&',
				nodeIdFn: '&',
				nodeParentIdFn: '&'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'dateFilter',
				'$interpolate',
				'$compile',
				'$templateCache',
				'$timeout',
				function (
					$scope,
					$element,
					$attrs,
					dateFilter,
					$interpolate,
					$compile,
					$templateCache,
					$timeout
				) {

					var template = $templateCache.get('directives/treeViewNode.tpl.html');

					$scope.getNodeId = function (node) {
						return $scope.nodeIdFn({node: node});
					};

					$scope.getNodeParentId = function (node) {
						return $scope.nodeParentIdFn({node: node});
					};

					$scope.getNodeParent = function (node, getNodeParentIdFn) {
						return (getNodeParentIdFn(node))? $scope.nodeLookUp[getNodeParentIdFn(node)] : null;
					};

					$scope.getNodeParentElement = function (node, getNodeParentIdFn) {
						return (getNodeParentIdFn(node))? $scope.elementLookUp[getNodeParentIdFn(node)] : null;
					};

					$scope.getNodeParentScope = function (node, getNodeParentIdFn) {
						return (getNodeParentIdFn(node))? $scope.scopeLookUp[getNodeParentIdFn(node)] : null;
					};

					$scope.getNodeSiblings = function (node, getNodeParentIdFn) {
						// return (getNodeParentIdFn(node))? $scope.childrenLookUp[getNodeParentIdFn(node)] : null;
						var parentNodeId = getNodeParentIdFn(node);
						if( parentNodeId ){
							$scope.childrenLookUp[parentNodeId] = $scope.childrenLookUp[parentNodeId] || [];
							return $scope.childrenLookUp[parentNodeId];
						}
						else {
							return null;
						}
					};

					$scope.getNodeChildren = function (node, getNodeIdFn) {
						return $scope.childrenLookUp[getNodeIdFn(node)];
					};

					$scope._nodeHasChildren = function (node, getNodeIdFn) {
						var children = $scope.getNodeChildren(node, getNodeIdFn);
						return (children && children.length > 0);
 						// return ($scope.getNodeChildren(node, getNodeIdFn).length > 0);
					};

					$scope.nodeHasChildren = function (node) {
						return $scope._nodeHasChildren(node, $scope.getNodeId);
					};

					$scope.populateNodeLookUp = function (nodes, getNodeIdFn) {
						$scope.nodeLookUp = _.indexBy(nodes, getNodeIdFn);
					};

					$scope.stackNode = function (node) {
						$scope.nodetack.push(node);
					};

					$scope.stackNodes = function (nodes) {
						$scope.nodeStack = $scope.nodeStack.concat(nodes);
					};

					$scope.initScope = function (scope) {
						// scope.showChildren = (scope.node.children.length)? false : true;
						scope.showChildren = false;
						scope.toggleChildren = function () {
							scope.showChildren = !scope.showChildren;
							// if( $scope.nodeHasChildren(scope.node, getNodeIdFn) ){
							// 	scope.showChildren = !scope.showChildren;
							// }
						};
					};

					$scope.addTreeNode = function (node, parentScope, childrenPlaceholder) {
						// var childrenPlaceholder = parentElement.find("#children:first");
						var childScope = parentScope.$new(true);
						node.children = [];
						angular.extend(childScope, _.pick($scope, 'nodeLabel', 'nodeBody', 'nodeHasChildren'), {node: node});
						$scope.initScope(childScope);
						var childElement = angular.element(template);
						// element.find("#children").append(childElement);
						childrenPlaceholder.append(childElement);
						$compile(childElement)(childScope);

						// return [childScope, childElement];
						return {
							scope: childScope,
							element: childElement
						};
					};

					$scope.nodeStack = [];
					$scope.nodeLookUp = {};
					$scope.elementLookUp = {};
					$scope.scopeLookUp = {};
					$scope.childrenLookUp = {};

					$scope.buildTree = function (nodes, getNodeIdFn, getNodeParentIdFn) {
						$scope.populateNodeLookUp(nodes, getNodeIdFn);
						$scope._buildTree(nodes, getNodeIdFn, getNodeParentIdFn);
					};

					$scope._buildTree = function (nodes, getNodeIdFn, getNodeParentIdFn) {
						angular.forEach(nodes, function(node, index) {
							var parent = $scope.getNodeParent(node, getNodeParentIdFn) || null;
							var parentElement = $scope.getNodeParentElement(node, getNodeParentIdFn) || $element;
							var parentScope = $scope.getNodeParentScope(node, getNodeParentIdFn) || $scope;
							var childrenPlaceholder = parentElement.find("#children:first");
							var nodeData = $scope.addTreeNode(node, parentScope, childrenPlaceholder);

							// add the node as a child to its parent in the model
							// if( parent ){
							// 	parent.children = parent.children || [];
							// 	parent.children.push(node);
							// }

							// add the node as a child to its parent in the model
							if( parent ){
								var nodeSiblings = $scope.getNodeSiblings(node, getNodeParentIdFn);
								if( nodeSiblings ){
									nodeSiblings.push(node);
								}
							}
							var nodeid = getNodeIdFn(node);
							$scope.elementLookUp[nodeid] = nodeData.element;
							$scope.scopeLookUp[nodeid] = nodeData.scope;
						});
					};

					$scope.destroyTree = function (nodes, getNodeIdFn, getNodeParentIdFn) {
						// get the top level nodes and destroy their scopes
						// var topLevelNodes = _.filter(nodes, function (node) {
						// 						return !$scope.getNodeParent(node, getNodeParentIdFn);
						// 					});
						_.chain(nodes)
						.filter(function (node) {
							return !$scope.getNodeParent(node, getNodeParentIdFn);
						})
						.each(function (node) {
							var nodeScope = $scope.scopeLookUp[getNodeIdFn(node)];
							if(nodeScope) {
								nodeScope.$destroy();
							}
						});

						// clear the top level $element's children in the dom
						$element.find("#children:first").empty();

						// clear the lookups
						$scope.nodeLookUp = {};
						$scope.elementLookUp = {};
						$scope.scopeLookUp = {};
						$scope.childrenLookUp = {};
					};

					$scope.$watchCollection('nodes', function (newNodes, oldNodes) {
						if( !angular.equals(newNodes, oldNodes) ){
							$scope.destroyTree(oldNodes, $scope.getNodeId, $scope.getNodeParentId);
							$scope.buildTree(newNodes, $scope.getNodeId, $scope.getNodeParentId);
						}
					});

 					// $timeout(function () {
					// 	$scope.destroyTree($scope.nodes, $scope.getNodeId, $scope.getNodeParentId);
					// }, 30000);
				}
			]
		};
	}
])
