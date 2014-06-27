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

		// var dictionaryFactory = function (label, idFunction) {
		var dictionaryFactory = function (label) {
			var dictionary = {};

			var dictionaryService = {
				label: "",
				// init: function (label, idFunction) {
				init: function (label) {
					this.initLabel(label);
					// this.initIdFunction(idFunction);
				},
				initLabel: function (label) {
					if( angular.isDefined(label) ){
						this.label = label;
					}
				},
				// initIdFunction: function (idFunction) {
				// 	if( angular.isDefined(idFunction)
				// 	 && angular.isFunction(idFunction) ){
				// 		this.getId = idFunction;
				// 	}
				// },
				// getId: function (value) {
				// 	return value.$id();
				// },
				set: function (key, value) {
					dictionary[key] = value;
					// dictionary.setEntry(key, value);
					// dictionary[key] = value;
				},
				// setEntry: function (key, value) {
				// 	dictionary[key] = value;
				// },
				// setEntryItem: function (item) {
				// 	var key = this.getId(item);
				// 	// this.setEntry(key, item);
				// 	this.set(key, item)
				// },
				// build: function (items, force) {
				// 	// console.log("building dictionary");
				// 	var that = this;
				// 	angular.forEach(items, function(value, key) {
				// 		var itemId = that.getId(value)
				// 		// console.log("itemid is : " + itemId);

				// 		if( !angular.isDefined(dictionary[itemId]) || force ){
				// 			dictionary[itemId] = value;
				// 		}
				// 	});
				// 	console.log("items in dictionary after build");
				// 	console.log(dictionary);
				// },
				setList: function (keyValueMap, force) {
					var that = this;
					var filteredKeyValueMap = {};
					if( force ){
						filteredKeyValueMap = keyValueMap;
					}
					else {
						// exclude any pre-defined items in the
						// keyValueMap and then extend
						angular.forEach(keyValueMap, function(value, key) {
							if( !angular.isDefined(that.lookUp(key)) ){
								filteredKeyValueMap[key] = value;
							}
						});
					}
					angular.extend(dictionary, filteredKeyValueMap);

					// // console.log("building dictionary");
					// var that = this;
					// angular.forEach(items, function(value, key) {
					// 	var itemId = that.getId(value)
					// 	// console.log("itemid is : " + itemId);

					// 	if( !angular.isDefined(dictionary[itemId]) || force ){
					// 		dictionary[itemId] = value;
					// 	}
					// });

					console.log("items in dictionary after setList");
					console.log(dictionary);
				},
				lookUp: function (key) {
					return dictionary[key];
				},
				lookUpList: function (keys) {
					// console.log("items in dictionary");
					// console.log(dictionary);
					var values = [];
					values = _.map(keys, function (key) {
								return dictionary[key];
							});
					values = _.filter(values, function (value) {
								return angular.isDefined(value);
							});
					return values;
				}
				// lookUpList: function (itemsIdList) {
				// 	// console.log("items in dictionary");
				// 	// console.log(dictionary);
				// 	var items = [];
				// 	items = _.map(itemsIdList, function (itemId) {
				// 				return dictionary[itemId];
				// 			});
				// 	items = _.filter(items, function (item) {
				// 				return angular.isDefined(item);
				// 			});
				// 	return items;
				// }
			};

			dictionaryService.init(label);

			return dictionaryService;
		};
		return dictionaryFactory;
	}
]);