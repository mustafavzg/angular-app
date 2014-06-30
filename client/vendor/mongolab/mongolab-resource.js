angular.module('mongolabResource', [
	'services.dictionary',
	'resourceCache',
	'underscore'
])
.factory('mongolabResource', [
	'MONGOLAB_CONFIG',
	'$http',
	'$q',
	'$timeout',
	'resourceCacheFactory',
	'dictionary',
	'_',
	function (MONGOLAB_CONFIG, $http, $q, $timeout, resourceCacheFactory, dictionary, _) {

		function MongolabResourceFactory(collectionName) {


			var url = MONGOLAB_CONFIG.baseUrl + MONGOLAB_CONFIG.dbName + '/collections/' + collectionName;
			var defaultParams = {};
			if (MONGOLAB_CONFIG.apiKey) {
				defaultParams.apiKey = MONGOLAB_CONFIG.apiKey;
			}
			var thenFactoryMethod = function (httpPromise, successcb, errorcb, isArray) {
				var scb = successcb || angular.noop;
				var ecb = errorcb || angular.noop;

				return httpPromise.then(
					function (response) {
						var result;
						if (isArray) {
							result = [];
							// console.log("Resource Count for: " + collectionName);
							// console.log("Count is : " + response.data.length);
							for (var i = 0; i < response.data.length; i++) {
								result.push(new Resource(response.data[i]));
							}
						} else {
							//MongoLab has rather peculiar way of reporting
							//not-found items, I would expect 404 HTTP response
							//status...
							if (response.data === " null "){
								return $q.reject({
									code:'resource.notfound',
									collection:collectionName
								});
							} else {
								result = new Resource(response.data);
							}
						}
						// console.log("resourceCache is :");
						// console.log(resourceCache.get(url + '/' + result.$id()));
						scb(result, response.status, response.headers, response.config);
						return result;
					},
					function (response) {
						// Mongolab sometimes returns with 405 even though the
						// resources exist, so retry the request in 100ms in
						// that case
						if(response.status === 405) {
							console.log("Got 405 for resource: " + collectionName);
							console.log(response.config);
							console.log("Retrying the request in  100ms for: " + collectionName);
							var httpPromiseRetry = $timeout(
								function () {
									console.log("Retrying the request now for: " + collectionName);
									return $http.get(response.config.url, response.config);
							}, 100);

							// var httpPromiseRetry = $http.get(response.config);
							return thenFactoryMethod(httpPromiseRetry, scb, ecb, isArray);
							return undefined;
						}
						else if (response.data.message === 'Document not found') {
							ecb(response, response.status, response.headers, response.config);
							return $q.reject("The entity you were looking for does not exist. It could be a deleted item");
						}
						else {
							// ecb(undefined, response.status, response.headers, response.config);
							// console.log("respone is");
							// console.log(response);
							console.log("failed response");
							console.log(JSON.stringify(response.data));

							ecb(response, response.status, response.headers, response.config);
							return undefined;
						}

					}
				);
			};

			var Resource = function (data) {
				angular.extend(this, data);
			};

			// Maps collection names to the names used as forein keys
			// in the objects
			// These relations will be moved to the backend
			// persistence later
			var resourceForeignKeyMap = dictionary('resourceForeignKeyMap');
			resourceForeignKeyMap.setList({
				tasks: {
					default : 'taskId'
				},
				projects: {
					default: 'projectId'
				},
				sprints: {
					default: 'sprintId'
				},
				productbacklog: {
					default: 'productBacklogItemId'
				},
				users: {
					default: 'userId'
				},
				scrumupdates: {
					default: 'scrumUpdateId'
				}
			});

			// Specific resource implementations can override the
			// configuration here for the foreignKeyMap
			Resource.foreignKeyMap = resourceForeignKeyMap;

			Resource.getResourceKey = function (collectionName, relationKey) {
				// return resourceForeignKeyMap[collectionName];
				if( !angular.isDefined(relationKey) ){
					relationKey = 'default';
				}
				var relationMap = resourceForeignKeyMap.lookUp(collectionName);
				if( angular.isDefined(relationMap) ){
					return relationMap[relationKey];
				}
				return '';
			};

			Resource.getSimpleIds = function (itemsOrIds) {
				var qin = [];
				angular.forEach(itemsOrIds, function (itemOrId) {
					if(!!itemOrId){
						if( angular.isObject(itemOrId) ){
							var item = itemOrId;
							qin.push(item.$id());
						}
						else {
							var id = itemOrId;
							qin.push(id);
						}
					}
				});
				return qin;
			}

			// var getObjectIds = function (itemIds) {
			// 	var qin = [];
			// 	angular.forEach(itemIds, function (id) {
			// 		if(!!id){
			// 			qin.push({$oid: id});
			// 		}
			// 	});
			// 	return qin;
			// }

			Resource.getObjectIds = function (itemsOrIds) {
				var qin = [];
				angular.forEach(itemsOrIds, function (itemOrId) {
					if(!!itemOrId){
						if( angular.isObject(itemOrId) ){
							var item = itemOrId;
							qin.push(item._id);
						}
						else {
							var id = itemOrId;
							qin.push({$oid: id});
						}
					}
				});
				return qin;
			}

			var cacheService = resourceCacheFactory(collectionName);
			var resourceCache = cacheService.getResourceCache();

			/**************************************************
			 * Query items
			 **************************************************/
			Resource.query = function (queryJson, successcb, errorcb) {
				var params = angular.isObject(queryJson) ? {q:JSON.stringify(queryJson)} : {};
				// cacheService.checkAndClear(url, queryJson);
				cacheService.checkAndClear('GLOBAL'); // this is temporary until cache dependencies are implemented

				var httpPromise = $http.get(url, {cache:resourceCache, params:angular.extend({}, defaultParams, params)});

				return thenFactoryMethod(httpPromise, successcb, errorcb, true);
			};

			Resource.all = function (cb, errorcb) {
				return Resource.query({}, cb, errorcb);
			};

			Resource.getById = function (id, successcb, errorcb) {
				var itemUrl = url + '/' + id;
				// cacheService.checkAndClear(itemUrl);
				cacheService.checkAndClear('GLOBAL'); // this is temporary until cache dependencies are implemented

				var httpPromise = $http.get(itemUrl, {cache:resourceCache, params:angular.extend({}, defaultParams)});
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.getByIds = function (ids, successcb, errorcb) {
				return Resource.query({_id:{$in:Resource.getObjectIds(ids)}}, successcb, errorcb, true);
			};

			// Query for the current resource based on other resource foreign key
			// eg. get all scrumUpdates for a task
			// ScrumUpdates.forResource('tasks', 123, successcb, errrorcb);
			Resource.forResource = function (collectionName, itemOrId, successcb, errorcb) {
				var itemId;
				if( angular.isObject(itemOrId) ){
					var item = itemOrId;
					itemId = item.$id();
				}
				else {
					itemId = itemOrId;
				}
				var resourceForeignKey = Resource.getResourceKey(collectionName);
				var query = {};
				query[resourceForeignKey] = itemId;
				return Resource.query(query, successcb, errorcb);
			};

			// Query for the current resource based on a list of other resource
			// foreign keys
			// eg. get all scrumUpdates for a list of task ids
			// ScrumUpdates.forResourceList('tasks', [123, 456], successcb, errrorcb);
			Resource.forResourceList = function (collectionName, itemsOrIds, successcb, errorcb) {
				var resourceForeignKey = Resource.getResourceKey(collectionName);
				var query = {};
				query[resourceForeignKey] = {$in:Resource.getSimpleIds(itemsOrIds)};
				return Resource.query(query, successcb, errorcb);
			};

			/**************************************************
			 * Save items
			 **************************************************/
			Resource.saveMultiple = function (items, successcb, errorcb) {
				var httpPromise = $http.post(url, items, {params:defaultParams});
				cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			/**************************************************
			 * Update items
			 **************************************************/
			Resource.updateMultiple = function (query, update, successcb, errorcb) {
				var params = {m: "true", q:JSON.stringify(query)};
				var updateJson = JSON.stringify(update);
				var httpPromise = $http.put(url, updateJson, {params:angular.extend({}, defaultParams, params)});
				// cacheService.setDirty(itemUrl);
				cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.updateMultipleItems = function (itemsOrIds, update, successcb, errorcb) {
				var objectIds = Resource.getObjectIds(itemsOrIds);
				console.log("object ids are");
				console.log(objectIds);
				return Resource.updateMultiple({_id:{$in:objectIds}}, update, successcb, errorcb);
			};

			/**************************************************
			 * Remove items
			 **************************************************/
			Resource.removeMultiple = function (query, successcb, errorcb) {
				// var params = {q:JSON.stringify(query)};
				// Delete method does not seem to be supported by the rest api
				// var httpPromise = $http['delete'](url, {params:angular.extend({}, defaultParams, params)});
				// // cacheService.setDirty(itemUrl);
				// cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				// return thenFactoryMethod(httpPromise, successcb, errorcb);
				return Resource.updateMultiple(query, [], successcb, errorcb);
			};

			Resource.removeMultipleItems = function (itemsOrIds, successcb, errorcb) {
				var objectIds = Resource.getObjectIds(itemsOrIds);
				console.log("object ids are");
				console.log(objectIds);
				return Resource.removeMultiple({_id:{$in:objectIds}}, successcb, errorcb);
			};

			Resource.removeAll = function (successcb, errorcb) {
				return Resource.removeMultiple({}, successcb, errorcb);
			};


			/**************************************************
			 * Instance methods
			 **************************************************/
			Resource.prototype.$id = function () {
				if (this._id && this._id.$oid) {
					return this._id.$oid;
				}
			};

			Resource.prototype.$save = function (successcb, errorcb) {
				var httpPromise = $http.post(url, this, {params:defaultParams});
				cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$update = function (successcb, errorcb) {
				var itemUrl = url + "/" + this.$id();

				// setCacheEntry(itemUrl, this);
				// var httpPromise = $http.put(itemUrl, angular.extend({}, this, {_id:undefined}), {cache:resourceCache, params:defaultParams});

				var httpPromise = $http.put(itemUrl, angular.extend({}, this, {_id:undefined}), {params:defaultParams});

				// cacheService.setDirty(itemUrl);
				cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$remove = function (successcb, errorcb) {
				// return thenFactoryMethod($q.reject("Failing remove"), successcb, errorcb);
				var itemUrl = url + "/" + this.$id();
				var httpPromise = $http['delete'](itemUrl, {params:defaultParams});

				// cacheService.setDirty(itemUrl);
				cacheService.setDirty('GLOBAL'); // this is temporary until cache dependencies are implemented
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
				if (this.$id()) {
					return this.$update(updatecb, errorUpdatecb);
				} else {
					return this.$save(savecb, errorSavecb);
				}
			};

			return Resource;
		}
		return MongolabResourceFactory;
	}
]);
