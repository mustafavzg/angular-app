angular.module('moment', [])
.factory(
	'moment',
	function($window) {
		return $window.moment; // assumes moment has already been loaded on the page
	}
);