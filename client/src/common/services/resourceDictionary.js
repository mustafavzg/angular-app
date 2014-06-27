angular.module('services.resourceDictionary', [
	'services.dictionary',
	'underscore'
]);

angular.module('services.resourceDictionary').factory('resourceDictionary', [
	'dictionary',
	'_',
	'$injector',
	// function ( dictionaryService, _ ) {
	function ( dictionaryService, _, $injector ) {

		// console.log("the dictionary service");
		// console.log(JSON.stringify(dictionaryService));

		var dictionaryFactory = function (label, idFunction) {

			// dictionary service is not being injected due
			// some circular dependency (have to this figure out),
			// for now explicitly injecting the service via
			// injector
			dictionaryService = $injector.get('dictionary');
			// console.log("the dictionary service");
			// console.log(dictionaryService.toString());
			// console.log(dictionaryService);

			// var dictionary = dictionaryService(label, idFunction);
			var dictionary = dictionaryService(label);

			var resourceDictionaryService = {
				init: function (idFunction) {
					this.initIdFunction(idFunction);
				},
				// initLabel: function (label) {
				// 	if( angular.isDefined(label) ){
				// 		this.label = label;
				// 	}
				// },
				initIdFunction: function (idFunction) {
					if( angular.isDefined(idFunction)
					 && angular.isFunction(idFunction) ){
						this.getId = idFunction;
					}
				},
				getId: function (value) {
					return value.$id();
				},
				// set: function (key, value) {
				// 	dictionary.setEntry(key, value);
				// 	// dictionary[key] = value;
				// },
				setItem: function (item) {
					var key = this.getId(item);
					// this.setEntry(key, item);
					dictionary.set(key, item)
					// dictionary.setEntryItem(item);
					// var key = this.getId(item);
					// this.setEntry(key, item)
				},
				setItems: function (items, force) {
					// dictionary.build(items, force);
					var that = this;
					var keyValueMap = {};
					angular.forEach(items, function(item) {
						var key = that.getId(item);
						keyValueMap[key] = item;
					});
					dictionary.setList(keyValueMap, force);
					// console.log("building dictionary");
					// var that = this;
					// angular.forEach(items, function(value, key) {
					// 	var itemId = that.getId(value)
					// 	// console.log("itemid is : " + itemId);
					// 	if( !angular.isDefined(dictionary[itemId]) || force ){
					// 		dictionary[itemId] = value;
					// 	}
					// });
					// console.log("items in dictionary after build");
					// console.log(dictionary);
				},
				// lookUp: function (key) {
				// 	return dictionary.lookUp(key);
				// 	// return dictionary[key];
				// },
				lookUpItem: function (itemId) {
					return dictionary.lookUp(itemId);
					// return dictionary[key];
				},
				lookUpItems: function (itemsIdList) {
					return dictionary.lookUpList(itemsIdList);
					// // console.log("items in dictionary");
					// // console.log(dictionary);
					// var items = [];
					// items = _.map(itemsIdList, function (itemId) {
					// 			return dictionary[itemId];
					// 		});
					// items = _.filter(items, function (item) {
					// 			return angular.isDefined(item);
					// 		});
					// return items;
				}
			};

			resourceDictionaryService.init(idFunction);

			return resourceDictionaryService;
		};
		return dictionaryFactory;
	}
]);