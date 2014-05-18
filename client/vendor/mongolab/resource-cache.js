angular.module('resourceCache', [])
.factory('resourceCacheFactory', [
	'$cacheFactory',
	function($cacheFactory) {
		function ResourceCacheFactory(collectionName) {
			return $cacheFactory(collectionName);
		}
		return ResourceCacheFactory;
	}
]);