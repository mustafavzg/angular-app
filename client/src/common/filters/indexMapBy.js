angular.module('filters.indexMapBy', [
	'underscore',
	'filters.toItemGroup',
	'services.dictionary'
])
.filter('indexMapBy', [
	'_',
	'toItemGroupFilter',
	'dictionary',
	function (
		_,
		toItemGroupFilter,
		dictionaryFactory
	) {

		// leaf index is a dictionary based on the
		// idFunction that should generate unique keys
		function buildLeafIndex(obj, idFunction) {
			var result = {};

			angular.forEach(obj, function(items, key) {
				var tempMap = {};
				angular.forEach(items, function(item, index) {
					tempMap[idFunction(item)] = item;
					// indexMap.set(item, idFunction(item));
				});
				var indexMap = dictionaryFactory(key);
				indexMap.setList(tempMap);

				// result[key] = indexMap.getDictionary();
				result[key] = indexMap;
			});
			return toItemGroupFilter(result, obj._targets);
			// return result;
		};

		function _indexMapBy( obj, idFunction, targets ) {
			var groupedByObj = {};
			if( !targets.length ){
				return buildLeafIndex(obj, idFunction);
			}
			if( obj instanceof Array ){
				var target = targets.shift();
				groupedByObj = _.groupBy(obj, target);
				groupedByObj = toItemGroupFilter(groupedByObj, _.flatten([target, targets]));
				return _indexMapBy(groupedByObj, idFunction, targets);
			}
			else if( obj instanceof Object ){
				angular.forEach(obj, function(items, key) {
					var targetsCopy = _.clone(targets);
					groupedByObj[key] = _indexMapBy(items, idFunction, targetsCopy);
				});

				// return groupedByObj;
				return toItemGroupFilter(groupedByObj, obj._targets);
			}
			else {
				return obj;
			}
		};

		return function indexMapBy(obj, idFunction) {
			// obj : is the items array which needs to be grouped
			// idFunction : function that generates the uniqueid for the item

			// Slice the arguments to contain an array targets for groupBy keys
			var targets = Array.prototype.slice.call(arguments, 2);
			// var targets = _.toArray(arguments).slice(2);
 			if( _.isArray(targets[0]) ){
				targets = targets[0];
			}

			return _indexMapBy(obj, idFunction, _.clone(targets));
		};

	}
]);
