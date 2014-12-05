angular.module('filters.stopWatch', [
	'underscore'
])
.filter('stopWatch', [
	'_',
	function (_) {
		var setPadding = function (element, type) {
			return ( element < 10 )? '0' + element : '' + element;
 		};

		var setSuffix = function (element, type) {
			var suffixMap = {
				dd: 'days'
			};
			return element + (suffixMap[type] || '');
 		};

		var format = function (days, timeElements, deciseconds) {
			var allTimeElements = new Array();
			// Days
			if( angular.isDefined(days) && days > 0){
				var formattedDays = setSuffix(setPadding(days), 'dd');
				allTimeElements.push(formattedDays);
			}

			// Time in HH::MM::SS
			var formattedTimeElements = new Array();
			angular.forEach(timeElements.reverse(), function(element) {
				if( angular.isDefined(element) ){
					formattedTimeElements.push(setSuffix(setPadding(element)));
				}
			});
			if(formattedTimeElements.length){
				allTimeElements.push(formattedTimeElements.join(':'));
			}

			// Deciseconds
			if( angular.isDefined(deciseconds) ){
				var formattedDeciseconds = setSuffix(deciseconds);
				allTimeElements.push(formattedDeciseconds);
			}

			// return formattedDays + ' ' + formattedTimeElements.join(':') + ' ' + formattedDeciseconds;
			return allTimeElements.join(" ");

		};

		/**************************************************
		 * Memoized functions for better performance
		 **************************************************/

		var getDays = _.memoize(function (timeinhours) {
			return Math.floor(timeinhours / 24);
		});

		var getHours = _.memoize(function (timeinminutes) {
			return Math.floor(timeinminutes / 60);
		});

		var getMinutes = _.memoize(function (timeinseconds) {
			return Math.floor(timeinseconds / 60);
		});

		var hoursTail = _.memoize(function (timeinhours) {
			return timeinhours % 24 || 0;
		});

		var minutesTail = _.memoize(function (timeinminutes) {
			return timeinminutes % 60 || 0;
		});

		var secondsTail = _.memoize(function (timeinseconds) {
			return timeinseconds % 60 || 0;
		});

		return function (timeinmills) {
			var hoursMinsSeconds = new Array();
			var days;

			var timeindeciseconds = Math.floor(timeinmills / 100);
			var deciseconds = timeindeciseconds % 10 || 0;

			// if( timeindeciseconds > 0 ){
			// 	var timeinseconds = Math.floor(timeindeciseconds / 10) || 0;
			// 	var seconds = timeinseconds % 60;
			// 	hoursMinsSeconds.push(seconds);

			// 	if( timeinseconds > 0 ){
			// 		var timeinminutes = Math.floor(timeinseconds / 60) || 0;
			// 		var minutes = timeinminutes % 60;
			// 		hoursMinsSeconds.push(minutes);

			// 		if( timeinminutes > 0 ){
			// 			var timeinhours = Math.floor(timeinminutes / 60) || 0;
			// 			var hours = timeinhours % 24;
			// 			hoursMinsSeconds.push(hours);

			// 			if( timeinhours > 0 ){
			// 				var timeindays = Math.floor(timeinhours / 24);
			// 				days = timeindays;
			// 			}
			// 		}
			// 	}
			// }

			// var timeinseconds = Math.floor(timeindeciseconds / 10);
			// var seconds = timeinseconds % 60 || 0;
			// hoursMinsSeconds.push(seconds);

			// var timeinminutes = Math.floor(timeinseconds / 60);
			// var minutes = timeinminutes % 60 || 0;
			// hoursMinsSeconds.push(minutes);

			// var timeinhours = Math.floor(timeinminutes / 60);
			// var hours = timeinhours % 24 || 0;
			// hoursMinsSeconds.push(hours);

			// var timeindays = Math.floor(timeinhours / 24);
			// days = timeindays;

			var timeinseconds = Math.floor(timeindeciseconds / 10);
			var seconds = secondsTail(timeinseconds);
			hoursMinsSeconds.push(seconds);

			var timeinminutes = getMinutes(timeinseconds);
			var minutes = minutesTail(timeinminutes);
			hoursMinsSeconds.push(minutes);

			var timeinhours = getHours(timeinminutes);
			var hours = hoursTail(timeinhours);
			hoursMinsSeconds.push(hours);

			var timeindays = getDays(timeinhours);
			days = timeindays;

			// return format(days, hoursMinsSeconds, deciseconds);
			return format(days, hoursMinsSeconds);

			// return days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds, " + deciseconds + " deciseconds, ";
		};
	}
]);