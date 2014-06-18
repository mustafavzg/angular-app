angular.module('directives.warningblock', [
	'services.directiveInitializer',
	'directives.icon',
	'ui.bootstrap'
])

// A help block with a warning sign
// Mostly used to display some warning
.directive('warningBlock', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/warningblock.tpl.html',
			replace: true,
			transclude: true,
			// priority: -1000,
			scope: {
				rootDivClass: '@?',
				show: '@?'
			},
			controller: [
				'$scope',
				'$element',
				'$attrs',
				'directiveInitializer',
				function ($scope, $element, $attrs, directiveInitializer) {

 					$scope.self = {};
					var attrsData = {
						attrs: $attrs,
						interpolationKeys: [
							'rootDivClass',
							'show'
						],
						attrDefaults: {
							show: false
						}
					};

					// setup the directive model based on interpolation and expression attributes
					directiveInitializer.init($scope, $scope.self, attrsData, true);
					// console.log("warning block scope.self");
					// console.log($scope.self);
				}
			]
		};
	}
]);
