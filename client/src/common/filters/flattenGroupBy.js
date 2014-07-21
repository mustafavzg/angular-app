angular.module('filters.flattenGroupBy', [
	'underscore',
	'filters.toItemGroup'
])
.filter('flattenGroupBy', [
	'_',
	'toItemGroupFilter',
	function ( _, toItemGroupFilter ) {

		var _flatten = function (itemGroups, targets) {
			var flatList = [];
			itemGroups.forEach(function(itemGroup) {
				if( !targets.length ){
					flatList.push(itemGroup);
				}
				else {
					var targetsCopy = _.clone(targets);
					var target = targetsCopy.shift();
					if( !_.isUndefined(itemGroup.key)
					 && !_.isUndefined(itemGroup.values)){
						var tempList = _flatten(itemGroup.values, targetsCopy);
						if( _.isArray(tempList) ){
							flatList = flatList.concat(tempList);
						}
					}
					else {
						flatList.push(itemGroup);
					}
				}
			});
			return flatList;
		};

		var getGroupingKey = function (valueStack) {
			return valueStack.join("::");
		};

		var pushToFlatGroup = function (key, value, flattenedData) {
			if( !_.isArray(flattenedData[key]) ){
				flattenedData[key] = new Array();
			}
			flattenedData[key].push(value);
		};

		var getMetaObject = function (values, key, targets) {
			var temp = {};
			temp['key'] = key;
			temp['values'] = values;
			temp = toItemGroupFilter(temp, targets, key.split("::"));
			return temp;
		};

		var _flattenShallow = function (itemGroups, targets, flattenedData, keyStack, valueStack) {

			itemGroups.forEach(function(itemGroup) {
				if( !targets.length ){
					var key = getGroupingKey(valueStack);
					pushToFlatGroup(key, itemGroup, flattenedData);
				}
				else {
					var targetsCopy = _.clone(targets);
					var target = targetsCopy.shift();
					keyStack.push(target);
					valueStack.push(itemGroup.key);
					if( !_.isUndefined(itemGroup.key)
					 && !_.isUndefined(itemGroup.values)){
						_flattenShallow(itemGroup.values, targetsCopy, flattenedData, keyStack, valueStack);
						keyStack.pop();
						valueStack.pop();
					}
					else {
						pushToFlatGroup(getGroupingKey(valueStack), itemGroup, flattenedData);
					}
				}
			});
			return flattenedData;
		};

		var flattenShallow = function (itemGroups, asObject) {
			var flattenedData = {};
			var keyStack = [];
			var valueStack = [];

			var targets = [];
			if( !_.isArray(itemGroups) && _.isObject(itemGroups) ){
				itemGroups = _.values(itemGroups) || [];
			}

			if( itemGroups.length ){
				targets = itemGroups[0].getTargets();
			}

			var flatObj = _flattenShallow(itemGroups, targets, flattenedData, keyStack, valueStack);

			var result;
			if( asObject ){
				result = {};
				_.each(flatObj, function (values, key) {
					result[key] = getMetaObject(values, key, targets);
				});
			}
			else {
				result = [];
				_.each(flatObj, function (values, key) {
							result.push(getMetaObject(values, key, targets));
						});
			}

			return result;
		};

		var flatten = function (itemGroups, shallow, asObject) {
			var targets = [];
			if( !_.isArray(itemGroups) && _.isObject(itemGroups) ){
				itemGroups = _.values(itemGroups) || [];
			}

			if( itemGroups.length ){
				targets = itemGroups[0].getTargets();
			}

			if( shallow ){
				return flattenShallow(itemGroups, asObject);
			}
			else {
				return _flatten(itemGroups, targets);
			}
		};

		return flatten;

	}
]);
