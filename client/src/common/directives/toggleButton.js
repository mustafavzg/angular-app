angular.module('directives.toggleButton', [
	'services.directiveInitializer',
	'directives.icon',
	'ui.bootstrap'
])

// An clickable icon that performs an action
.directive('toggleButton', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/toggleButton.tpl.html',
			replace: true,
			scope: {
				tip: '@',
				icon: '@?',
				flip: '@?',
				invert: '@?',
				action: '&?',
				actionDisabled: '@?'
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
							'tip',
							'icon',
							'flip',
							'invert',
							'actionDisabled'
						],
						expressionKeys: [
							'action'
						],
						attrDefaults: {
							icon: "info-sign"
							// fix the bug here, false is flipping
							// the icons, possibly taken as string
							// even directive attribute is not working
							// flip: false
						}
					};

					// setup the directive model based on interpolation and expression attributes
					directiveInitializer.init($scope, $scope.self, attrsData, true);
					// console.log("action icon scope.self");
					// console.log($scope.self);

				}
			]
		};
	}
]);
