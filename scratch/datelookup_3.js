angular.module('directives.datelookup', [
	'ui.bootstrap'
])

// A date picker with a pop up
.directive('datelookup', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/datelookup.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				// name: '@',
				fieldName: '@name',
				label: '@',
				required: '@',
				date: '='
			},
			link: function(scope, element, attrs, ngform) {
				// scope.formName = scope.name + "Form";
				// scope.date = scope.date || new Date();
				scope.ngform = ngform;
				scope.opened = false;

				// Disable weekend selection
				scope.disabled = function(date, mode) {
					return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
				};

				scope.open = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					scope.opened = true;
				};

				scope.dateOptions = {
					formatYear: 'yy',
					startingDay: 1
				};

				scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'];
				scope.format = scope.formats[2];

				scope.showError = function (error) {
					return scope.ngform.dateField.$error[error];
				}

				scope.setValidationClasses = function () {
					return {
						'has-success' : scope.ngform.dateField.$valid,
						'has-error' : scope.ngform.dateField.$invalid
					};
				}

				console.log("PRINTING THE FORM OBJECT from the isolated scope");
				console.log(ngform);
			}
		};
	}
])
