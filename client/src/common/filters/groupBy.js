angular.module('filters.groupBy', ['underscore'])
.filter('groupBy', function (_) {
	return function (items, groupByKey) {
		return _.groupBy(items, groupByKey);
	};
});