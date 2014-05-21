angular.module('filters.isdefined', [])
.filter('isDefined', function () {
	return function (items) {
		return items.filter(function (item) {
			return (angular.isDefined(item)) ? 1 : 0;
		});
	};
});