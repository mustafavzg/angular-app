angular.module('filters.groupByFlat', [
	'underscore',
	'filters.toItemGroup'
])
.filter('groupByFlat', [
	'_',
	'toItemGroupFilter',
	function ( _, toItemGroupFilter ) {

		function _groupByFlat( obj, targets, flattenedData, keyStack, valueStack ) {
			if( obj instanceof Array ){
				var target = targets.shift();
				var groupedByObj = _.groupBy(obj, target);
				keyStack.push(target);
				_groupByFlat(groupedByObj, targets, flattenedData, keyStack, valueStack);
				keyStack.pop(target);
			}
			else if( obj instanceof Object ){
				if( !targets.length ){
					_.each(obj, function (values, key) {
						valueStack.push(key);
						var temp = {};
						var groupKey = valueStack.join("::");
						temp['key'] = groupKey;
						temp['values'] = values;
						temp = toItemGroupFilter(temp, _.clone(keyStack), valueStack);
						// console.log("key Stack Value");
						// console.log(keyStack);
						flattenedData[groupKey] = temp;
						valueStack.pop(key);
					});
				}
				else {
					_.each(obj, function (values, key) {
						valueStack.push(key);
						_groupByFlat(values, _.clone(targets), flattenedData, keyStack, valueStack);
						valueStack.pop(key);
					});
				}
			}
		};

		function groupByFlat( obj ) {
			var targets = Array.prototype.slice.call(arguments, 1);
			var flattenedData = {};
			var keyStack = [];
			var valueStack = [];
			_groupByFlat(obj, targets, flattenedData, keyStack, valueStack);
			return _.values(flattenedData);
		};

		return groupByFlat;
	}
]);
