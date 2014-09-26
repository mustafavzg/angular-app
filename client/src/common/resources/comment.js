angular.module('resources.comment', ['mongolabResource']);
angular.module('resources.comment')
.factory('Comments', [
	'mongolabResource',
	function (mongolabResource) {

		var Comments = mongolabResource('comments');

		var successcb = function(){
			console.log("Saved successfully!!!");
		};

		var failurecb = function(){
			console.log("cannot save...");
		};
		Comments.forProductBacklogItem = function (productBacklogItemId, successcb, errorcb) {
			return Comments.forResource('productbacklog', productBacklogItemId, successcb, errorcb);
		};

		Comments.forSprint = function (sprintId, successcb, errorcb) {
			return Comments.forResource('sprints', sprintId, successcb, errorcb);
		};

		Comments.forProject = function (projectId, successcb, errorcb) {
			return Comments.forResource('projects', projectId, successcb, errorcb);
		};

		Comments.forTask = function (taskId, successcb, errorcb) {
			return Comments.forResource('tasks', taskId, successcb, errorcb);
		};

			return Comments;
	}
]);