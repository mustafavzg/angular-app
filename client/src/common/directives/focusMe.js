angular.module('directives.focusMe', [
])

.directive('focusMe', function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			scope.$watch(attrs.focusMe, function(value) {
				if(value === true) {
					console.log("i am focussed more more");
					console.log('value=',value);
					//$timeout(function() {
					console.log(element);
					element.val("foobar");
					element.focus();
					scope[attrs.focusMe] = false;
					// element.focus();
					//});
				}
			});
		}
	};
});