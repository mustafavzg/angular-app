angular.module('directives.datewidget', [
	'ui.bootstrap'
])

// A date picker with a pop up
.directive('datelookup', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/datewidget.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				// name: '@',
				fieldName: '@name',
				required: '@',
				date: '='
			},
			link: function(scope, element, attrs, ngform) {

				// scope.formName = scope.name + "Form";
				scope.date = scope.date || new Date();
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

				scope.formstates = function () {
					return [ngform.$pristine,ngform.$dirty,ngform.$valid,ngform.$invalid];

					// return [1,2,3];
				};

				console.log("PRINTING THE FORM OBJECT from the isolated scope");
				console.log(ngform);

			}
		};
	}
])
