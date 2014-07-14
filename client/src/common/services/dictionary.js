angular.module('services.dictionary', ['underscore']);

angular.module('services.dictionary').factory('dictionary', [
	'_',
	function ( _ ) {

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
				set: function (key, value) {
					dictionary[key] = value;
				},
				setList: function (keyValueMap, force) {
					var that = this;
					var filteredKeyValueMap = {};
					if( force ){
						angular.forEach(keyValueMap, function(value, key) {
							var dest = that.lookUp(key);
							if( angular.isDefined(dest) ){
								// if both are objects merge them
								if( (angular.isObject(dest) && !angular.isArray(dest))
									&& (angular.isObject(value) && !angular.isArray(value))
								  ){
									angular.extend(dest, value);
								}
								// else overwrite the old value
								else {
									filteredKeyValueMap[key] = value;
								}
							}
							else {
								filteredKeyValueMap[key] = value;
							}
						});
						// filteredKeyValueMap = keyValueMap;
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
			};

			dictionaryService.init(label);

			return dictionaryService;
		};
		return dictionaryFactory;
	}
]);