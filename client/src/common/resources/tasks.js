angular.module('resources.tasks', ['mongolabResource']);
angular.module('resources.tasks')
.factory('Tasks', [
	'mongolabResource',
	function (mongolabResource) {

		var Tasks = mongolabResource('tasks');

		Tasks.statusEnum = ['TODO', 'IN_DEV', 'BLOCKED', 'IN_TEST', 'DONE'];

		Tasks.statusDef = [
			{
				key: 'TODO',
				name: 'To Do',
				ordering: 1,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				}
			},
			{
				key: 'DEV',
				name: 'Development',
				ordering: 2,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				}

			},
			{
				key: 'BLOCKED',
				name: 'Blocked',
				ordering: 3,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				}

			},
			{
				key: 'TEST',
				name: 'Test',
				ordering: 4,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				}

			},
			{
				key: 'DONE',
				name: 'Done',
				ordering: 5,
				btnclass : {
					inactive: 'btn-warning',
					active: 'btn-success'
				}
			}
		];

		Tasks.forProductBacklogItem = function (productBacklogItem, successcb, errorcb) {
			return Tasks.query({productBacklogItem:productBacklogItem}, successcb, errorcb);
		};

		Tasks.forProductBacklogItemId = function (productBacklogItemId, successcb, errorcb) {
			return Tasks.query({productBacklogItemId:productBacklogItemId}, successcb, errorcb);
		};

		Tasks.forProductBacklogItemIdList = function (productBacklogItemIdList, successcb, errorcb) {
			return Tasks.query({productBacklogItemId:{$in:productBacklogItemIdList}}, successcb, errorcb);
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