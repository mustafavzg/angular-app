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
				label: '@',
				update: '=',
				datechosen: '='
			},
			link: function(scope, element, attrs, ngform) {
				scope.ngform = ngform;
				var currentDate = new Date();
				scope.dateCustomClass = function(date, mode) {
					if(date > currentDate || Object.getOwnPropertyNames(scope.update).length == 0 ){
						return {
							'btn-success': false,
							'btn-danger' : false
						};
					}
					else{
						return {
							'btn-success': scope.update[date.toDateString()] || false,
							'btn-warning' : (scope.update[date.toDateString()] == undefined) && (!(date.getDay() == 6 || date.getDay() ==0))
						};
					}
				};
			}
		};
	}
])
