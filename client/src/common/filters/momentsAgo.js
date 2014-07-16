angular.module('filters.momentsAgo', ['moment'])
.filter('momentsAgo', [
	'moment', 
	function (moment) {
		return function (item) {
			var formattedString;
			var givenDate = new Date(item);
			var dateInWords = moment(givenDate).format("dddd, MMMM Do YYYY");
			var timeAgo = moment([givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate()]).fromNow();
			return dateInWords + "    (" + timeAgo +")";
		};
	}
]);