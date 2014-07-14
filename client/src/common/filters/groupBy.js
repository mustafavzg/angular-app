angular.module('filters.groupBy', ['underscore'])
.filter('groupBy', function (_) {
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
					groupedByObj.push(temp);
				}
			}
			return groupedByObj;
		}
		else {
			return obj;
		}
	};

	return function groupBy(obj) {	
		// The first argument obj is the items array which needs to be grouped
		// Slice the arguments to contain an array of groupby keys
		var targets = Array.prototype.slice.call(arguments, 1);
		// Recursive function which groups by 				
		var result = _groupBy(obj, targets);
		return result;
	};
});
