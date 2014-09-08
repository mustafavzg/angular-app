angular.module('filters.groupBy', [
	'underscore',
	'filters.toItemGroup'
])
.filter('groupBy', [
	'_',
	'toItemGroupFilter',
	function ( _, toItemGroupFilter ) {

		function objToArray(obj) {
			if( obj instanceof Array ){
				return obj;
			}
			var result = [];
			for (var key in obj) {
				if(obj.hasOwnProperty(key)){
					var temp = {};
					temp['key'] = key;
					temp['values'] = obj[key];
					temp = toItemGroupFilter(temp, obj._targets);
					result.push(temp);
				}
			}
			return result;
		};

		function _groupBy( obj, targets ) {
			//var groupedByObj = {};
			var groupedByObj = [];
			if( !targets.length ){
				//return obj;
				return objToArray(obj);
			}
			if( obj instanceof Array ){
				var target = targets.shift();
				groupedByObj = _.groupBy(obj, target);
				groupedByObj = toItemGroupFilter(groupedByObj, _.flatten([target, targets]));
				return _groupBy(groupedByObj, targets);
			}
			else if( obj instanceof Object ){
				for (var key in obj) {
					if(obj.hasOwnProperty(key)){
						var valobj = obj[key];
						var targetsCopy = _.clone(targets);
						//groupedByObj[key] = _groupBy(valobj, targetsCopy);
						var temp = {};
						temp['key'] = key;
						temp['values'] = _groupBy(valobj, targetsCopy);
						temp = toItemGroupFilter(temp, obj._targets);
						groupedByObj.push(temp);
					}
				}
				return groupedByObj;
			}
			else {
				return obj;
			}
		};

		// /**************************************************
		//  * Set meta properties that can be used by the flatten
		//  * filter to unwind the groupedBy date structure
		//  **************************************************/
		// function toItemGroupFilter(groupedByObj, targets) {

		// 	var itemGroup = function (groupedByObj) {
		// 		_.extend(this, groupedByObj);
		// 	};

		// 	itemGroup.prototype.toItemGroupFilter = function (targets) {
		// 		if( _.isArray(targets) ){
		// 			itemGroup.prototype._targets = targets;
		// 		}
		// 	};

		// 	itemGroup.prototype.getTargets = function () {
		// 		return itemGroup.prototype._targets || [];
		// 	};

		// 	var tempObj = new itemGroup(groupedByObj);
		// 	tempObj.toItemGroupFilter(targets);
		// 	return tempObj;
		// };

		// /**************************************************
		//  * flatten collapse multi target item groups to a
		//  * single level group where the group key is a
		//  * concatenation of the multi target keys, e.g
		//  * multiple targets : alpha, beta, gamma
		//  * result : alpha::beta::gamma
		//  **************************************************/
		// var _flatten = function (itemGroups, targets) {
		// 	angular.forEach(itemGroups, function(itemGroup) {
		// 		var targetsCopy = _.clone(targets);
		// 		var target = targetsCopy.shift();
		// 		if( angular.isDefined(itemGroups.key)
		// 		 && angular.isDefined(itemGroups.values)){
		// 			return _flatten(itemGroups.values, targetsCopy);
		// 		}
		// 		else {
		// 			return itemGroup;
		// 		}
		// 	});
		// };

		return function groupBy(obj) {
			// The first argument obj is the items array which needs to be grouped
			// Slice the arguments to contain an array of groupby keys
			var targets = Array.prototype.slice.call(arguments, 1);
 			if( _.isArray(targets[0]) ){
				targets = targets[0];
			}

			// Recursive function which groups by
			// var result = _groupBy(obj, targets);
			// return toItemGroupFilter(result, targets);

			return _groupBy(obj, _.clone(targets));
		};
	}
]);
