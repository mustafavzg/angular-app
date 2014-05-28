angular.module('directives.icon', [
	'ui.bootstrap'
])

// A directive for icon (any icon should used be done via this directive)
.directive('icon', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/icon.tpl.html',
			replace: true,
			transclude: true,
			scope: {
				id: '@'
			}
		};
	}
])
