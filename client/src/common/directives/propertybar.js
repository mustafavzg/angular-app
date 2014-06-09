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
				properties: '=',
				rootDivClass: '@?',
				reverse: '@?',
				vertical: '@?'
			}
			// link: function(scope, element, attrs) {
			// }
		};
	}
])
