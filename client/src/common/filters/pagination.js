angular.module('filters.pagination', [])
.filter('pagination', function () {
	return function (items, currentPage, itemsPerPage) {
		var start = (currentPage - 1) * itemsPerPage;
		if( start < 0 ){
			start = 0;
		}
		// if( !!items && start > items.length ){
		if( start > items.length ){
			start = Math.floor(items/itemsPerPage) * itemsPerPage;
		}
		var end = start + itemsPerPage;
		// console.log("start " + start);
		// console.log("end " + end);
		// return (!!items)? items.slice(start, end) : [];
		return items.slice(start, end);
	};
});