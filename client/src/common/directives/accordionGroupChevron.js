angular.module('directives.accordionGroupChevron', [
	'ui.bootstrap'
])

// A directive for accordion group with an open and close chevron link
.directive('accordionGroupChevron', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/accordionGroupChevron.tpl.html',
			// replace: true,
			transclude: true,
			scope: {
				heading: '@',
				panelClass: '@?'
			},
			compile: function (element, attrs, transcludeFn) {
				return function postLink(scope, element, attrs, controller) {
					var newScope = scope.$parent.$new();
					element.find('.panel-body > div').append(transcludeFn(newScope));
					// element.find('.panel-body > div').append("fobar");
				};
			}
		};
	}
]);
