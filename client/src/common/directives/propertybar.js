angular.module('directives.propertybar', [
	'directives.icon',
	'ui.bootstrap'
])

// A user thumbnail with various options
.directive('propertyBar', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/propertybar.tpl.html',
			replace: true,
			// require: '^form',
			scope: {
				properties: '=?',
				getProperties: '&?',
				rootDivClass: '@?',
				reverse: '@?',
				vertical: '@?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'dateFilter',
				function ($scope, $element, $attrs, dateFilter) {
					$scope.propertiesFn = function () {
						if( $attrs['properties'] ){
							return $scope.properties;
						}
						if( $attrs['getProperties'] ){
							return $scope.getProperties();
						}
						// return [];
					};
				}
			]
			// link: function(scope, element, attrs) {
			// }
		};
	}
]);
