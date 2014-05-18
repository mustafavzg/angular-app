angular.module('directives.helptip', [
	'ui.bootstrap'
])

// A date picker with a pop up
.directive('helptip', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/helptip.tpl.html',
			replace: true,
			scope: {
				tip: '@',
				icon: '@'
			}
			// link: function(scope, element, attrs) {

			// 	scope.date = scope.date || new Date();
			// 	scope.opened = false;

			// 	// Disable weekend selection
			// 	scope.disabled = function(date, mode) {
			// 		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
			// 	};

			// }
		};
	}
])
