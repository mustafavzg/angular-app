angular.module('resources.tasks', ['mongolabResource']);
angular.module('resources.tasks')
.factory('Tasks', [
	'mongolabResource',
	function (mongolabResource) {

		var Tasks = mongolabResource('tasks');

		Tasks.statesEnum = ['TODO', 'IN_DEV', 'BLOCKED', 'IN_TEST', 'DONE'];

		Tasks.forProductBacklogItem = function (productBacklogItem, successcb, errorcb) {
			return Tasks.query({productBacklogItem:productBacklogItem}, successcb, errorcb);
		};

		Tasks.forProductBacklogItemId = function (productBacklogItemId, successcb, errorcb) {
			return Tasks.query({productBacklogItemId:productBacklogItemId}, successcb, errorcb);
		};

		Tasks.forSprint = function (sprintId, successcb, errorcb) {
			return Tasks.query({sprintId:sprintId}, successcb, errorcb);
		};

		Tasks.forUser = function (userId, successcb, errorcb) {
			return Tasks.query({assignedUserId:userId}, successcb, errorcb);
		};

		Tasks.forProject = function (projectId, successcb, errorcb) {
			return Tasks.query({projectId:projectId}, successcb, errorcb);
		};

		return Tasks;
	}
]);