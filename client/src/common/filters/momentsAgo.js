angular.module('filters.momentsAgo', ['moment'])
.filter('momentsAgo', [
	'moment', 
	function (moment) {
		return function (item) {
			console.log("Inside moments filter:\n");
			var formattedString;
			var givenDate = new Date(item);
			console.log(givenDate);
			var dateInWords = moment(givenDate).format("dddd, MMMM Do YYYY");
			var timeAgo = moment([givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate()]).fromNow();
			return dateInWords + "    (" + timeAgo +")";
		};
	}
]);