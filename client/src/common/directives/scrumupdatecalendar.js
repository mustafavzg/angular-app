angular.module('directives.scrumupdatecalendar', [
	'ui.bootstrap',
	'directives.datelookup',
	'ui.bootstrap.datepicker'
])

// A pair of date pickers, from date and to date
.directive('scrumupdatecalendar', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/scrumupdatecalendar.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				// name: '@',
				// fieldName: '@name',
				label: '@',
				update: "="
			},
			link: function(scope, element, attrs, ngform) {
				scope.ngform = ngform;
				var currentDate = new Date();
				var updateMap = {};
				updateMap = scope.update;
				scope.dateCustomClass = function(date, mode) {
					if(date > currentDate){
						return {
							'btn-success': false,
							'btn-danger' : false
						};
					}
					else{
						return {
							'btn-success': scope.update[date.toDateString()] || false,
							'btn-danger' : scope.update[date.toDateString()] == false
						};
					}
				};

				scope.showError = function (error) {
					return scope.ngform.$error[error];
				}

				// console.log("PRINTING THE FORM OBJECT from the date combo isolated scope");
				// console.log(ngform);
			}
		};
	}
])
