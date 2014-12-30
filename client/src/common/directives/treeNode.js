angular.module('directives.treeNode', [
	// 'directives.actionicon',
	// 'directives.propertybar',
	'ui.bootstrap',
	// 'filters.pagination',
	'underscore'
])

// A tree node directive
.directive('treeNode', [
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
			templateUrl: 'directives/treeNode.tpl.html',
			replace: true,
			scope: {
				node: '=',
				nodeLabel: '&',
				nodeBody: '&'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'dateFilter',
				'$interpolate',
				'$compile',
				'$templateCache',
				function (
					$scope,
					$element,
					$attrs,
					dateFilter,
					$interpolate,
					$compile,
					$templateCache
				) {

					// $scope.showChildren = ($scope.node.children.length)? false : true;
					// $scope.toggleChildren = function () {
					// 	if( $scope.node.children.length ){
					// 		$scope.showChildren = !$scope.showChildren;
					// 	}
					// };

					$scope.initScope = function (scope, node) {
						scope.showChildren = (scope.node.children.length)? false : true;
						scope.toggleChildren = function () {
							if( scope.node.children.length ){
								scope.showChildren = !scope.showChildren;
							}
						};
					};
					$scope.initScope($scope);

					var template = $templateCache.get('directives/treeNode.tpl.html');

					// $scope.addChildren = function (children, parentScope, element) {
					// 	var childrenPlaceholder = element.find("#children");
					// 	angular.forEach(children, function(child, index) {
					// 		var childScope = parentScope.$new(true);
					// 		angular.extend(childScope, _.pick($scope, 'nodeLabel', 'nodeBody'), {node: child});
					// 		$scope.initScope(childScope);
					// 		var childElement = angular.element(template);
					// 		// element.find("#children").append(childElement);
					// 		childrenPlaceholder.append(childElement);
					// 		$compile(childElement)(childScope);
					// 		// console.log("node is:");
					// 		// console.log(child);
					// 		if( child.children.length ){
					// 			$scope.addChildren(child.children, childScope, childElement);
					// 		}
					// 	});
					// };

					// $scope.addTreeNode = function (node, parentScope, childrenPlaceholder) {
					// 	// var childrenPlaceholder = parentElement.find("#children:first");
					// 	var childScope = parentScope.$new(true);
					// 	angular.extend(childScope, _.pick($scope, 'nodeLabel', 'nodeBody'), {node: node});
					// 	$scope.initScope(childScope);
					// 	var childElement = angular.element(template);
					// 	// element.find("#children").append(childElement);
					// 	childrenPlaceholder.append(childElement);
					// 	$compile(childElement)(childScope);

					// 	// return [childScope, childElement];
					// 	return {
					// 		scope: childScope,
					// 		element: childElement
					// 	};
					// };

					$scope.addChildren = function (children, parentScope, element) {
						var childrenPlaceholder = element.find("#children");
						angular.forEach(children, function(child, index) {
							var childScope = parentScope.$new(true);
							angular.extend(childScope, _.pick($scope, 'nodeLabel', 'nodeBody'), {node: child});
							$scope.initScope(childScope);
							var childElement = angular.element(template);
							// element.find("#children").append(childElement);
							childrenPlaceholder.append(childElement);
							$compile(childElement)(childScope);
							// console.log("node is:");
							// console.log(child);
							if( child.children.length ){
								$scope.addChildren(child.children, childScope, childElement);
							}
						});
					};
					$scope.addChildren($scope.node.children, $scope, $element);
				}
			]
		};
	}
])
