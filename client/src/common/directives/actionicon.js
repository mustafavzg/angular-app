angular.module('directives.actionicon', [
	'services.directiveInitializer',
	'directives.icon',
	'ui.bootstrap'
])

// An clickable icon that performs an action
.directive('actionIcon', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/actionicon.tpl.html',
			replace: true,
			scope: {
				tip: '@',
				icon: '@?',
				action: '&?'
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
							'icon'
						],
						expressionKeys: [
							'action'
						],
						attrDefaults: {
							icon: "info-sign"
						}
					};

					// setup the directive model based on interpolation and expression attributes
					directiveInitializer.init($scope, $scope.self, attrsData, true);
					console.log("action icon scope.self");
					console.log($scope.self);

				}
			]
		};
	}
]);
