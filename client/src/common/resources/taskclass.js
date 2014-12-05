angular.module('resources.taskclass', ['dbResource']);
angular.module('resources.taskclass')
.factory('TaskClass', [
	'dbResource',
	function (dbResource) {

		var TaskClass = dbResource('taskclass');

		TaskClass.getCollectionName = function(){
			return 'taskclass';
		};
		
		var successcb = function(){
			console.log("Saved successfully!!!");
		};

		var failurecb = function(){
			console.log("cannot save...");
		};
		
		return TaskClass;
	}
]);