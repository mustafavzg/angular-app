angular.module('resources.sprints', ['mongolabResource']);
angular.module('resources.sprints').factory('Sprints', [
	'mongolabResource',
	function (mongolabResource) {

		var Sprints = mongolabResource('sprints');
		Sprints.forProject = function (projectId, successcb, errorcb) {
			return Sprints.query({projectId:projectId}, successcb, errorcb);
		};
		return Sprints;
	}
]);