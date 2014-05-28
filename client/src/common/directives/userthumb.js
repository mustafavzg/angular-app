angular.module('directives.userthumb', [
	'directives.icon',
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
				action: '&?',
				roleFunction: '&?',
				actionName: '@?',
				actionIcon: '@?',
				actionButtonClass: '@?',
				actionDisabled: '@?',
				actionHidden: '@?'
			},
			link: function(scope, element, attrs) {

 				// console.log("user roles are");
				// console.log(scope.roleFunction({user: scope.user}));
				if( angular.isDefined(scope.roleFunction) ){
					scope.rolesDefined = true
				}

				scope.actionHidden = scope.actionHidden || false;
				scope.actionDisabled = scope.actionDisabled || scope.actionHidden || false;
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
