angular.module('directives.userthumb', [
	'ui.bootstrap'
])

// A user thumbnail with various options
.directive('userthumb', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/userthumb.tpl.html',
			replace: true,
			// require: '^form',
			scope: {
				user: '=',
				action: '&',
				actionName: '@',
				actionIcon: '@',
				actionButtonClass: '@',
				actionDisabled: '@?'
			},
			link: function(scope, element, attrs) {

				scope.actionDisabled = scope.actionDisabled || false;
				scope.action = scope.action || function () {/*a dummy action*/};

				// scope.date = scope.date || new Date();
				// scope.opened = false;

				// scope.setValidationClasses = function () {
				// 	return {
				// 		'has-success' : scope.ngform.dateField.$valid,
				// 		'has-error' : scope.ngform.dateField.$invalid
				// 	};
				// }

				// console.log("PRINTING THE FORM OBJECT from the isolated scope");
				// console.log(ngform);
			}
		};
	}
])
