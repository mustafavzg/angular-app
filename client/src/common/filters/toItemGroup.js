angular.module('filters.toItemGroup', ['underscore'])
.filter('toItemGroup', [
	'_',
	function ( _ ) {

		function toItemGroup(groupedByObj, targets, targetValues) {

			var itemGroup = function (groupedByObj) {
				_.extend(this, groupedByObj);
			};

			itemGroup.prototype.setTargets = function (targets) {
				if( _.isArray(targets) ){
					itemGroup.prototype._targets = targets;
				}
			};

			itemGroup.prototype.setTargetValues = function (targetValues) {
				if( _.isArray(targetValues) && _.isArray(targets)){
					var temp = {};
					_.each(
						targetValues,
						function (value, index) {
							temp[targets[index]] = value;
						}
					);
					itemGroup.prototype._targetValues = temp;
				}
			};

			itemGroup.prototype.getTargets = function () {
				return itemGroup.prototype._targets || [];
			};

			itemGroup.prototype.getTargetValues = function () {
				return itemGroup.prototype._targetValues || {};
			};

			var tempObj = new itemGroup(groupedByObj);
			if( !_.isUndefined(targets) ){
				tempObj.setTargets(targets);
			}
			if( !_.isUndefined(targetValues) ){
				tempObj.setTargetValues(targetValues);
			}

			return tempObj;
		};

		return toItemGroup;
	}
]);
