angular.module('security.authorization', ['security.service'])

// This service provides guard methods to support AngularJS routes.
// You can add them as resolves to routes to require authorization levels
// before allowing a route change to complete
.provider('securityAuthorization', {

	requireAdminUser: [
		'securityAuthorization',
		function(securityAuthorization) {
			return securityAuthorization.requireAdminUser();
		}
	],

	requireAuthenticatedUser: [
		'securityAuthorization',
		function(securityAuthorization) {
			return securityAuthorization.requireAuthenticatedUser();
		}
	],

	$get: [
		'security',
		'securityRetryQueue',
		function(security, queue) {
			var service = {

				// Require that there is an authenticated user
				// (use this in a route resolve to prevent non-authenticated users from entering that route)
				requireAuthenticatedUser: function() {
					// var promise = security.requestCurrentUser().then(
					// 	function(userInfo) {
					// 		if ( !security.isAuthenticated() ) {
					// 			return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
					// 		}
					// 	});
					var promise = security.requestCurrentUser();
					// return 1;
					return promise;
				},

				// Require that there is an administrator logged in
				// (use this in a route resolve to prevent non-administrators from entering that route)
				requireAdminUser: function() {
					// var promise = security.requestCurrentUser().then(
					// 	function(userInfo) {
					// 		if ( !security.isAdmin() ) {
					// 			return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
					// 		}
					// 	});
					// return 1;
					var promise = security.requestCurrentUser();
					return promise;
				}

			};

			return service;
		}
	]
});