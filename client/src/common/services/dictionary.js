angular.module('services.dictionary', ['underscore']);

angular.module('services.dictionary').factory('dictionary', [
	'_',
	function ( _ ) {

		var dictionary = {};

		return {
			init: function (idFunction) {
				if( angular.isDefined(idFunction)
				 && angular.isFunction(idFunction) ){
					this.getId = idFunction;
				}
			},
			getId: function (value) {
				return value.$id();
			},
			build: function (items) {
				console.log("building dictionary");

				var that = this;
				angular.forEach(items, function(value, key) {
					var itemId = that.getId(value)
					console.log("itemid is : " + itemId);

					if( !angular.isDefined(dictionary[itemId]) ){
						dictionary[itemId] = value;
					}
				});
				console.log("items in dictionary after build");
				console.log(dictionary);

			},
			lookUp: function (itemsIdList) {
				console.log("items in dictionary");
				console.log(dictionary);
				var items = [];
				items = _.map(itemsIdList, function (itemId) {
							return dictionary[itemId];
						});
				items = _.filter(items, function (item) {
							return angular.isDefined(item);
						});
				return items;
			}
		};
	}
]);