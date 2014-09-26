angular.module('athenawebappResource', ['resourceCache'])
.factory('athenawebappResource', [
	'MONGOLAB_CONFIG',
	'ATHENAWEBAPP_CONFIG',
	'$http',
	'$q',
	'resourceCacheFactory',
	function (MONGOLAB_CONFIG, ATHENAWEBAPP_CONFIG, $http, $q, resourceCacheFactory) {

		function AthenaWebAppResourceFactory(collectionName) {

			// var url = ATHENAWEBAPP_CONFIG.baseUrl + ATHENAWEBAPP_CONFIG.dbName + '/collections/' + collectionName;
			// var defaultParams = {};
			// if (MONGOLAB_CONFIG.apiKey) {
			// 	defaultParams.apiKey = MONGOLAB_CONFIG.apiKey;
			// }

			var url = ATHENAWEBAPP_CONFIG.baseUrl + '/collections/' + collectionName;
			var defaultParams = {};

			function lcfirst(str) {
				str += '';
				var f = str.charAt(0).toLowerCase();
				return f + str.substr(1);
			}

			function clonelc(obj) {
				// Handle the 3 simple types, and null or undefined
				if (null == obj || "object" != typeof obj) return obj;

				// Handle Date
				if (obj instanceof Date) {
					var copy = new Date();
					copy.setTime(obj.getTime());
					return copy;
				}

				// Handle Array
				if (obj instanceof Array) {
					var copy = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						copy[i] = clonelc(obj[i]);
					}
					return copy;
				}

				// Handle Object
				if (obj instanceof Object) {
					// if it is a date object
					var copy;
					if( obj.hasOwnProperty('__CLASS__') && obj['__CLASS__'] === 'DateTime'){
						if( angular.isDefined(obj['Date']) ){
							var datesplit = obj['Date'].split('-');
							copy = new Date(datesplit[0], datesplit[1], datesplit[2]);
						}
						else {
							copy = undefined;
						}
						return copy;
					}

					// if not a date
					copy = {};
					for (var attr in obj) {
						var re = /^[A-Z][A-Z]+/;
						var cattr;
						if (re.test(attr)) {
							cattr = attr;
						} else {
							cattr = lcfirst(attr);
						}
						if (obj.hasOwnProperty(attr)) copy[cattr] = clonelc(obj[attr]);
					}
					return copy;
				}

				throw new Error("Unable to copy obj! Its type isn't supported.");
			}

			var thenFactoryMethod = function (httpPromise, successcb, errorcb, isArray) {
				var scb = successcb || angular.noop;
				var ecb = errorcb || angular.noop;

				return httpPromise.then(
					function (response) {
						var result;
						if (isArray) {

							result = [];
							for (var i = 0; i < response.data.length; i++) {
								result.push(new Resource(clonelc(response.data[i])));
							}
						} else {
							//Mongolab has rather peculiar way of reporting
							//not-found items, I would expect 404 HTTP response
							//status...
							if (response.data === " null "){
								return $q.reject({
									code:'resource.notfound',
									collection:collectionName
								});
							} else {
								result = new Resource(clonelc(response.data));
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
                // var params = angular.isObject(queryJson) ? {q:JSON.stringify(queryJson)} : {};
                var params = angular.isObject(queryJson) ? queryJson : {};

				if( isDirty() ){
					resourceCache.removeAll();
					clearDirty();
				}

                // var httpPromise = $http.get(url);
                // var httpPromise = $http.get(url);
                console.log("fetching the new get");
                console.log("resource cache factory:");
                console.log(resourceCache);
				var httpPromise = $http.get(url, {cache:resourceCache, params:angular.extend({}, defaultParams, params)});
                // var httpPromise = $http.get(url, {params:angular.extend({}, defaultParams, params)});

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
				// var qin = [];
				// angular.forEach(ids, function (id) {
				// 	qin.push({$oid: id});
				// });
				// return Resource.query({_id:{$in:qin}}, successcb, errorcb);
                return Resource.query({INCLUDEIDS: ids}, successcb, errorcb);
			};

			//instance methods

			Resource.prototype.$id = function () {
				return this.ID;
				// if (this._id && this._id.$oid) {
				// 	return this._id.$oid;
				// }
				// else {
				// 	return -111;
				// }
			};

			Resource.prototype.$save = function (successcb, errorcb) {
				setDirty();
				var httpPromise = $http.post(url, this, {params:defaultParams});
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$update = function (successcb, errorcb) {
				setDirty();
				var httpPromise = $http.put(url + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
				return thenFactoryMethod(httpPromise, successcb, errorcb);
			};

			Resource.prototype.$remove = function (successcb, errorcb) {
				setDirty();
				var httpPromise = $http['delete'](url + "/" + this.$id(), {params:defaultParams});
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
		return AthenaWebAppResourceFactory;
	}
]);

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