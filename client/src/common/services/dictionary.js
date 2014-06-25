angular.module('services.dictionary', ['underscore']);

angular.module('services.dictionary').factory('dictionary', [
	'_',
	function ( _ ) {

		// var dictionary = {};

		// return {
		// 	init: function (idFunction) {
		// 		if( angular.isDefined(idFunction)
		// 		 && angular.isFunction(idFunction) ){
		// 			this.getId = idFunction;
		// 		}
		// 	},
		// 	getId: function (value) {
		// 		return value.$id();
		// 	},
		// 	build: function (items) {
		// 		// console.log("building dictionary");

		// 		var that = this;
		// 		angular.forEach(items, function(value, key) {
		// 			var itemId = that.getId(value)
		// 			// console.log("itemid is : " + itemId);

		// 			if( !angular.isDefined(dictionary[itemId]) ){
		// 				dictionary[itemId] = value;
		// 			}
		// 		});
		// 		// console.log("items in dictionary after build");
		// 		// console.log(dictionary);
		// 	},
		// 	lookUp: function (itemId) {
		// 		return dictionary[itemId];
		// 	},
		// 	lookUpList: function (itemsIdList) {
		// 		// console.log("items in dictionary");
		// 		// console.log(dictionary);
		// 		var items = [];
		// 		items = _.map(itemsIdList, function (itemId) {
		// 					return dictionary[itemId];
		// 				});
		// 		items = _.filter(items, function (item) {
		// 					return angular.isDefined(item);
		// 				});
		// 		return items;
		// 	}
		// };

		var dictionaryFactory = function (label, idFunction) {

			var dictionary = {};

			var dictionaryService = {
				label: "",
				init: function (label, idFunction) {
					this.initLabel(label);
					this.initIdFunction(idFunction);
				},
				initLabel: function (label) {
					if( angular.isDefined(label) ){
						this.label = label;
					}
				},
				initIdFunction: function (idFunction) {
					if( angular.isDefined(idFunction)
					 && angular.isFunction(idFunction) ){
						this.getId = idFunction;
					}
				},
				getId: function (value) {
					return value.$id();
				},
				build: function (items, force) {
					// console.log("building dictionary");

					var that = this;
					angular.forEach(items, function(value, key) {
						var itemId = that.getId(value)
						// console.log("itemid is : " + itemId);

						if( !angular.isDefined(dictionary[itemId]) || force ){
							dictionary[itemId] = value;
						}
					});
					console.log("items in dictionary after build");
					console.log(dictionary);
				},
				lookUp: function (itemId) {
					return dictionary[itemId];
				},
				setEntry: function (item) {
					var key = this.getId(item);
					dictionary[key] = item;
				},
				lookUpList: function (itemsIdList) {
					// console.log("items in dictionary");
					// console.log(dictionary);
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

			dictionaryService.init(label, idFunction);

			return dictionaryService;
		};
		return dictionaryFactory;
	}
]);