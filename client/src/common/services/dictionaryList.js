angular.module('services.dictionaryList', ['underscore']);

angular.module('services.dictionaryList').factory('dictionaryList', [
	'_',
	function ( _ ) {

 		// var dictionaryListFactory = function (label, idFunction) {
		var dictionaryListFactory = function (label) {
			var dictionaryList = {};

			var dictionaryListService = {
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
				set: function (key, value) {
					dictionaryList[key] = value;
				},
				setList: function (keyValueMap) {
					angular.extend(dictionaryList, keyValueMap);
				},
				merge: function (key, value) {
					dictionaryList[key] = dictionaryList[key] || [];
					dictionaryList[key].push(value);
				},
				mergeList: function (keyValueMap) {
					var that = this;
					var mergeKeyValueMap = {};
					// Merge the previous values with the new ones
					angular.forEach(keyValueMap, function(value, key) {
						var dest = that.lookUp(key) || [];
						dest = dest.concat(value);
						mergeKeyValueMap[key] = dest;
					});
					angular.extend(dictionaryList, mergeKeyValueMap);
					// console.log("items in dictionaryList after mergeList");
					// console.log(dictionaryList);
				},
				clear: function (key) {
					delete dictionaryList[key];
				},
				clearList: function (keys) {
					var i = -1, len = keys.length;
					for(; ++i < len;){
						this.clear(keys[i]);
					}
				},
				lookUp: function (key) {
					return dictionaryList[key];
				},
				lookUpList: function (keys) {
					// console.log("items in dictionaryList");
					// console.log(dictionaryList);
					var values = [];
					values = _.map(keys, function (key) {
								return dictionaryList[key];
							});
					values = _.filter(values, function (value) {
								return angular.isDefined(value);
							});
					return values;
				},
				getLookUp: function () {
					return dictionaryList;
				}

			};

			dictionaryListService.init(label);

			return dictionaryListService;
		};
		return dictionaryListFactory;
	}
]);