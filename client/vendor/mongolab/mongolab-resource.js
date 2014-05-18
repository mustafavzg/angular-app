angular.module('mongolabResource', ['resourceCache'])
.factory('mongolabResource', [
	'MONGOLAB_CONFIG',
	'$http',
	'$q',
	'$timeout',
	'resourceCacheFactory',
	function (MONGOLAB_CONFIG, $http, $q, $timeout, resourceCacheFactory) {

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
							console.log("Resource Count for: " + collectionName);
							console.log("Count is : " + response.data.length);
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
						else {
							ecb(undefined, response.status, response.headers, response.config);
							return undefined;

						}

					}
				);
			};

			var Resource = function (data) {
				angular.extend(this, data);
			};

			var dirtyflag = false;
			var collection = collectionName;
			var setDirty = function () {
				dirtyflag = true;
				console.log(collection + ' is dirty !!!!!!!');
			};

			var clearDirty = function () {
				dirtyflag = false;
				console.log(collection + ' is clear !!!!!!!');
			};

			var isDirty = function () {
				return dirtyflag;
			};

			Resource.checkDirty = function () {
				return isDirty();
			};

			Resource.all = function (cb, errorcb) {
				return Resource.query({}, cb, errorcb);
			};

			var resourceCache = resourceCacheFactory(collectionName);
			Resource.query = function (queryJson, successcb, errorcb) {
				var params = angular.isObject(queryJson) ? {q:JSON.stringify(queryJson)} : {};

				if( isDirty() ){
					resourceCache.removeAll();
					clearDirty();
				}

				var httpPromise = $http.get(url, {cache:resourceCache, params:angular.extend({}, defaultParams, params)});

				return thenFactoryMethod(httpPromise, successcb, errorcb, true);
			};

			Resource.getById = function (id, successcb, errorcb) {
				// var httpPromise = $http.get(url + '/' + id, {params:defaultParams});
				if( isDirty() ){
					resourceCache.removeAll();
					clearDirty();
				}
				var httpPromise = $http.get(url + '/' + id, {cache:resourceCache, params:angular.extend({}, defaultParams)});
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.getByIds = function (ids, successcb, errorcb) {
				var qin = [];
				angular.forEach(ids, function (id) {
					qin.push({$oid: id});
				});
				return Resource.query({_id:{$in:qin}}, successcb, errorcb, true);
			};

			//instance methods

			Resource.prototype.$id = function () {
				if (this._id && this._id.$oid) {
					return this._id.$oid;
				}
			};

			Resource.prototype.$save = function (successcb, errorcb) {
				var httpPromise = $http.post(url, this, {params:defaultParams});
				setDirty();
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$update = function (successcb, errorcb) {
				var httpPromise = $http.put(url + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
				setDirty();
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$remove = function (successcb, errorcb) {
				var httpPromise = $http['delete'](url + "/" + this.$id(), {params:defaultParams});
				setDirty();
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
