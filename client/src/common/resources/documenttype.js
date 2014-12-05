angular.module('resources.documenttype', ['dbResource']);
angular.module('resources.documenttype')
.factory('DocumentType', [
	'dbResource',
	function (dbResource) {

		var DocumentType = dbResource('documenttype');

		var successcb = function(){
			console.log("Saved successfully!!!");
		};

		var failurecb = function(){
			console.log("cannot save...");
		};
		DocumentType.forProductBacklogItem = function (productBacklogItemId, successcb, errorcb) {
			return DocumentType.forResource('productbacklog', productBacklogItemId, successcb, errorcb);
		};

		DocumentType.forSprint = function (sprintId, successcb, errorcb) {
			return DocumentType.forResource('sprints', sprintId, successcb, errorcb);
		};

		DocumentType.forProject = function (projectId, successcb, errorcb) {
			return DocumentType.forResource('projects', projectId, successcb, errorcb);
		};

		DocumentType.forTask = function (taskId, successcb, errorcb) {
			return DocumentType.forResource('tasks', taskId, successcb, errorcb);
		};

			return DocumentType;
	}
]);