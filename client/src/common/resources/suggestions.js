angular.module('resources.suggestions', [
	'dbResource'
]);
angular.module('resources.suggestions').factory('Suggestions', [
	'dbResource',
	function (dbResource) {
		var suggestions = dbResource('suggestions');
		suggestions.getCollectionName = function(){
			return 'suggestions';
		};
		return suggestions;
	}
]);
