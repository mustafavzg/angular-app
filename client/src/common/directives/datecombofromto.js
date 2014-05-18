angular.module('directives.datecombofromto', [
	'ui.bootstrap',
	'directives.datelookup'
])

// A pair of date pickers, from date and to date
.directive('datecombofromto', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/datecombofromto.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				// name: '@',
				// fieldName: '@name',
				fromDateLabel: '@',
				toDateLabel: '@',
				fromDateRequired: '@',
				toDateRequired: '@',
				fromDate: '=',
				toDate: '='
			},
			link: function(scope, element, attrs, ngform) {
				scope.fromDate = scope.fromDate || new Date();
				if( !angular.isDefined(scope.toDate) ){
					// console.log("GOING IN THE APPLY FUNCTION!!!");
					var date = new Date();
					date.setDate(scope.fromDate.getDate() + 1);
					scope.toDate = date
				}

				scope.startDateNew = scope.startDateNew || new Date();
				scope.ngform = ngform;

				scope.$watchGroup(['fromDate', 'toDate'], function (newObj, oldObj, scope) {
					if( !angular.equals(newObj, oldObj) ){
						if( scope.fromDate >= scope.toDate ){
							if( !angular.equals(newObj[0], oldObj[0]) ){
								scope.ngform.fromDate.dateField.$setValidity('datecombocheck', false);
							}
							if( !angular.equals(newObj[1], oldObj[1]) ){
								scope.ngform.toDate.dateField.$setValidity('datecombocheck', false);
							}
						}
						else {
							scope.ngform.fromDate.dateField.$setValidity('datecombocheck', true);
							scope.ngform.toDate.dateField.$setValidity('datecombocheck', true);
						}
					}
				});

				scope.showError = function (error) {
					return scope.ngform.$error[error];
				}

				scope.setValidationClasses = function () {
					return {
						'has-success' : scope.ngform.$valid,
						'has-error' : scope.ngform.$invalid
					};
				}

				console.log("PRINTING THE FORM OBJECT from the date combo isolated scope");
				console.log(ngform);
			}
		};
	}
])
