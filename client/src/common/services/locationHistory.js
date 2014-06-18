angular.module('services.locationHistory', ['underscore']);

angular.module('services.locationHistory').factory('locationHistory', [
	'$rootScope',
	'$location',
	'_',
	function ($rootScope, $location, _) {

		var history = [];
		var current;
		var future = [];

		/**************************************************
		 * These are only for testing
		 **************************************************/
		var getHistory= function () {
			return history;
		};
		var getFuture= function () {
			return future;
		};
		var getCurrent= function () {
			return current;
		};

		var locationHistory =  {
			init: function (path) {
				var that = this;
				$rootScope.$on('$routeChangeSuccess', function(event, current, previous, other){
					that.push($location.$$path);
					console.log("Route changed");
					console.log({
						history: getHistory(),
						lhcurrent: getCurrent(),
						future: getFuture(),
						location: $location,
						event: event,
						current: current,
						previous: previous,
						other: other
					});
				});
			},
			getCurrent: function () {
				return current;
			},
			getPrev: function () {
				return history.slice(-1)[0]
			},
			getNext: function () {
				return future.slice(-1)[0]
			},
			loadCurrent: function () {
				$location.path(current);
			},
			push: function (path) {
				if( angular.isDefined(current) && path !== current ){
					if( history.length && path === history.slice(-1)[0] ){
						this.prev(true);
						return;
					}
					if( future.length && path === future.slice(-1)[0] ){
						this.next(true);
						return;
					}
					history.push(current);
					future.splice(0);
				}
				current = path;
			},
			prev: function (skipLocationCall, discardCurrent) {
				if(history.length){
					if( !discardCurrent ){
						future.push(current);
					}
					current = history.pop();
				}
				if( !skipLocationCall ){
					console.log("calling location in locationHistory.prev");
					$location.path(current);
				}
				// return current;
			},
			next: function (skipLocationCall) {
				if(future.length){
					history.push(current);
					current = future.pop();
				}
				if( !skipLocationCall ){
					console.log("calling location in locationHistory.next");
					$location.path(current);
				}
				// return current;
			},
			hasHistory: function () {
				return (!history.length)? false : true;
			}
		};

		return locationHistory;
	}
]);