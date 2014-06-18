angular.module('resourceCache', [])
.factory('resourceCacheFactory', [
	'$cacheFactory',
	function($cacheFactory) {
		function ResourceCacheFactory(collectionName) {
			// return $cacheFactory(collectionName);

			var dirtyflag = false;
			var cacheValidator = {};
			var resourceCache;
			var resourceCacheService = {};

			resourceCacheService.init = function () {
				resourceCache = $cacheFactory(collectionName);
			};

			resourceCacheService.getResourceCache = function () {
				return resourceCache;
			};

			resourceCacheService.setDirtyKey = function (key) {
				cacheValidator[key] = true;
				// dirtyflag = true;
				console.log(collectionName + ' is dirty !!!!!!!');
			};

			resourceCacheService.clearDirtyKey = function (key) {
				cacheValidator[key] = false;
				// dirtyflag = false;
				console.log(collectionName + ' is clear !!!!!!!');
			};

			resourceCacheService.isDirtyKey = function (key) {
				return cacheValidator[key];
				// return dirtyflag;
			};

			resourceCacheService.getCacheKey = function (url, queryJson) {
				if( angular.isDefined(queryJson) ){
					var querystr = JSON.stringify(queryJson);
					var queryURIComponent = "?q=" + encodeURIComponent(querystr);
					return url + queryURIComponent;
				}
				return url;
			};

			resourceCacheService.setDirty = function (url, queryJson) {
				var key = this.getCacheKey(url, queryJson);
				this.setDirtyKey(key);
			};

			resourceCacheService.clearDirty = function (url, queryJson) {
				var key = this.getCacheKey(url, queryJson);
				this.clearDirtyKey(key);
			};

			resourceCacheService.isDirty = function (url, queryJson) {
				var key = this.getCacheKey(url, queryJson);
				this.isDirtyKey(key);
			};

			// we will be using 'GLOBAL' key until we implement cache dependencies
			resourceCacheService.checkAndClear = function (url, queryJson) {
				var key = this.getCacheKey(url, queryJson);
				if( this.isDirtyKey(key) ){
					(key === 'GLOBAL')? resourceCache.removeAll() : resourceCache.remove(key);
					this.clearDirtyKey(key);
				}
			};

			// To Do: use caching in save and update requests as well
			// use these with resourceCache object in $http saves and updates
			resourceCacheService.setCacheEntryKey = function (key, value) {
				resourceCache.put(key, value);
			};
			resourceCacheService.setCacheEntry = function (value, url, queryJson) {
				var key = this.getCacheKey(url, queryJson);
				resourceCache.put(key, value);
				this.clearDirtyKey(key);
			};

			resourceCacheService.init();
			return resourceCacheService;
		}
		return ResourceCacheFactory;
	}
]);