angular.module('resources.document', ['dbResource']);
angular.module('resources.document')
.factory('Documents', [
	'dbResource',
	function (dbResource) {

		var Documents = dbResource('document');

		var successcb = function(){
			console.log("Saved successfully!!!");
		};

		var failurecb = function(){
			console.log("cannot save...");
		};
		Documents.forProductBacklogItem = function (productBacklogItemId, successcb, errorcb) {
			return Documents.forResource('productbacklog', productBacklogItemId, successcb, errorcb);
		};

		Documents.forSprint = function (sprintId, successcb, errorcb) {
			return Documents.forResource('sprints', sprintId, successcb, errorcb);
		};

		Documents.forProject = function (projectId, successcb, errorcb) {
			return Documents.forResource('projects', projectId, successcb, errorcb);
		};

		Documents.forTask = function (taskId, successcb, errorcb) {
			return Documents.forResource('tasks', taskId, successcb, errorcb);
		};

			return Documents;
	}
]);