angular.module('resources.workflows', [
	'dbResource'
]);
angular.module('resources.workflows').factory('Workflows', [
	'dbResource',
	function (dbResource) {
		var workflows = dbResource('workflows');
		workflows.getCollectionName = function(){
			return 'workflows';
		};
		return workflows;
	}
]);