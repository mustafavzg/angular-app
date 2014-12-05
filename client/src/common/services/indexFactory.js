angular.module('services.indexFactory', [
	'services.dictionary',
	'filters.groupBy',
	'underscore'
]);

angular.module('services.indexFactory').factory('indexFactory', [
	'dictionary',
	'_',
	'$injector',
	'groupByFilter',
	// function ( dictionaryService, _ ) {
	function (
		dictionaryFactory,
		_,
		$injector,
		groupByFilter
	) {

		// console.log("the dictionary service");
		// console.log(JSON.stringify(dictionaryService));
		var indexFactory = function (indexAttrsOrFunc, uniqueIdAttrsOrFunc) {
			// dictionaryFactory = $injector.get('dictionary');

			var indexMap = dictionaryFactory('index');
			var reverseIndexMap = dictionaryFactory('reverseIndex');

			var indexService = {
				init: function (indexAttrsOrFunc, uniqueIdAttrsOrFunc) {
					this.initIndexIdFunction(indexAttrsOrFunc);
					this.initUniqueIdFunction(uniqueIdAttrsOrFunc);
				},
				initIndexIdFunction: function (indexAttrsOrFunc) {
					if( angular.isFunction(indexAttrsOrFunc) ){
						this.getIndexId = indexAttrsOrFunc;
					}
					else if ( angular.isArray(indexAttrsOrFunc) ) {
						this.indexAttributes = indexAttrsOrFunc;
					}
				},
				initUniqueIdFunction: function (uniqueIdAttrsOrFunc) {
					if( angular.isFunction(uniqueIdAttrsOrFunc) ){
						this.getUniqueId = uniqueIdAttrsOrFunc;
					}
					else if ( angular.isArray(uniqueIdAttrsOrFunc) ) {
						this.uniqueIdAttributes = uniqueIdAttrsOrFunc;
					}
				},

				getIndexId: function (item) {
					// return _(this.indexAttributes).map(function (indexAttr) {
					// 	return item[indexAttr];
					// }).join('_');
					return _.chain(this.indexAttributes).map(function (indexAttr) {
						return item[indexAttr];
					}).value().join('_');
				},
				getUniqueId: function (item) {
					return _.chain(this.uniqueIdAttributes).map(function (uniqueIdAttr) {
						return item[uniqueIdAttr];
					}).value().join('_');
				},

				indexItem: function (item) {
					var indexKey = this.getIndexId(item);
					var itemUniqueId = this.getUniqueId(item);
					var childIndexMap = indexMap.lookUp(indexKey);
					if( angular.isDefined(childIndexMap) ){
						// add the item to the new childIndexMap
						childIndexMap.set(itemUniqueId, item);
					}
					else {
						// create a new childIndexMap
						childIndexMap = dictionaryFactory(indexKey);

						// add the item to the new childIndexMap
						childIndexMap.set(itemUniqueId, item);

						// set the childIndexMap
						indexMap.set(indexKey, childIndexMap);
					}
					reverseIndexMap.set(itemUniqueId, indexKey);
				},

				indexItems: function (items) {
					var that = this;
					angular.forEach(items, function(item) {
						that.indexItem(item);
					});
				},

				indexItem2: function (item) {
					// traverse the indexMap and add the item to the index
					var indexNode = indexMap || {};
					var indexPath = [];
					var itemIndexKeyUndefined;
					// var foo;
					// console.log(angular.isDefined(foo = undefined));
					var that = this;

					angular.forEach(that.indexKeys, function(indexKey, indexKeyCounter) {
						if( !itemIndexKeyUndefined ){
							if( angular.isDefined(item[indexKey]) ){
								indexPath.push(item[indexKey]);
								if( angular.isDefined(indexNode[item[indexKey]]) ){
									// if the path exists
									// add the item to the dictionary
									if( that.indexKeys.length == indexKeyCounter + 1 ){
										indexNode[item[indexKey]].set(that.getUniqueId(item), item);
									}
									else {
										indexNode = indexNode[item[indexKey]];
									}
								}
								else {
									// if the path does not exist
									// create it and also the dictionary
									if( that.indexKeys.length == indexKeyCounter + 1 ){
										indexNode[item[indexKey]] = dictionaryFactory(item[indexKey]);
										indexNode[item[indexKey]].set(that.getUniqueId(item), item);
									}
									else {
										indexNode[item[indexKey]] = {};
										indexNode = indexNode[item[indexKey]];
									}
								}
							}
							else {
								itemIndexKeyUndefined = indexKey;
							}
						}
					});

					if( itemIndexKeyUndefined ){
						// notify about the error
						console.log("Cannot index item as property:'" + itemIndexKeyUndefined + "' is undefined");
					}
				},

				indexItems2: function (items) {
					var that = this;
					angular.forEach(items, function(item) {
						that.indexItem2(item);
					});
				},

				// look up the index
				lookUp: function (indexId) {
					return indexMap.lookUp(indexId);
				},
				lookUpList: function (indexIdList) {
					return indexMap.lookUpList(indexIdList);
				},

				// look up the items
				lookUpItem: function (itemId) {
					var indexKey = reverseIndexMap.lookUp(itemId);
					if( angular.isDefined(indexKey) ){
						var childIndexMap = indexMap.lookUp(indexKey);
						if( angular.isDefined(childIndexMap) ){
							return childIndexMap.lookUp(itemId);
						}
					}
					return undefined;
				},

				lookUpItems: function (itemsIdList) {
					var that = this;
					var items =  _.map(itemsIdList, function(itemId) {
						return that.lookUpItem(itemId);
					});
					return items;
				}

			};

			indexService.init(indexAttrsOrFunc, uniqueIdAttrsOrFunc);

			return indexService;
		};
		return indexFactory;
	}
]);