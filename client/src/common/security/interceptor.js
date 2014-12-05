angular.module('security.interceptor', ['security.retryQueue'])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', [
	'$injector',
	'securityRetryQueue',
	'$q',
	function($injector, queue, $q) {

		// angular v1.3.0-
		// return function(promise) {
		// 	// Intercept failed requests
		// 	return promise.then(
		// 		null,
		// 		function(originalResponse) {
		// 			if(originalResponse.status === 401) {
		// 				// The request bounced because it was not authorized - add a new request to the retry queue
		// 				promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
		// 					// We must use $injector to get the $http service to prevent circular dependency
		// 					return $injector.get('$http')(originalResponse.config);
		// 				});
		// 			}
		// 			return promise;
		// 		}
		// 	);
		// };

		// angular v1.3.1+
		return {
			'responseError': function(response) {
				if(response.status === 401) {
					// The request bounced because it was not authorized - add a new request to the retry queue
					return queue.pushRetryFn('unauthorized-server', function retryRequest() {
						// We must use $injector to get the $http service to prevent circular dependency
						return $injector.get('$http')(response.config);
					});
				}
				return $q.reject(response);
			}
		};

	}])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config([
	'$httpProvider',
	function($httpProvider) {
		// angular v1.3.0-
		// $httpProvider.responseInterceptors.push('securityInterceptor');

		// angular v1.3.1+
		$httpProvider.interceptors.push('securityInterceptor');
	}
]);