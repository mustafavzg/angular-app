angular.module('resources.tasks', [
	'mongolabResource',
	'services.resourceDictionary'
]);
angular.module('resources.tasks')
.factory('Tasks', [
	'mongolabResource',
	'resourceDictionary',
	function (mongolabResource, resourceDictionary) {

		var Tasks = mongolabResource('tasks');

		Tasks.statusEnum = ['TODO', 'IN_DEV', 'BLOCKED', 'IN_TEST', 'DONE'];

 		/**************************************************
		 * Status Defintions
		 * Will be moved to back end persistence
		 **************************************************/
		var statusDef = [
			{
				key: 'TODO',
				name: 'To Do',
				ordering: 1,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#62C0DC'
			},
			{
				key: 'DEV',
				name: 'Development',
				ordering: 2,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#8DB173'
			},
			{
				key: 'BLOCKED',
				name: 'Blocked',
				ordering: 3,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#AE4A32'
			},
			{
				key: 'TEST',
				name: 'Test',
				ordering: 4,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#F38725'
			},
			{
				key: 'DONE',
				name: 'Done',
				ordering: 5,
				btnclass : {
					inactive: 'btn-warning',
					active: 'btn-success'
				},
				color: '#D1C4B1'
			}
		];

		var statusDictionary = resourceDictionary(
			'status',
			function (status) {
				return status.key;
			}
		);
		statusDictionary.setItems(statusDef);

		Tasks.getStatusDef = function () {
			return statusDef;
		};

		Tasks.prototype.getStatusDef = function (status) {
			status = status || this.status;
			return statusDictionary.lookUpItem(status) || {};
		};


 		/**************************************************
		 * Type Defintions
		 * Will be moved to back end persistence
		 **************************************************/
		// CFCE95, 88697B, FACDD0, CEE0F4, FFDE99
		Tasks.typeDef = [
			{
				key: 'ALPHA',
				name: 'alpha',
				ordering: 1,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#CFCE95'
			},
			{
				key: 'BETA',
				name: 'beta',
				ordering: 2,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#88697B'
			},
			{
				key: 'GAMMA',
				name: 'gamma',
				ordering: 3,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#FACDD0'
			},
			{
				key: 'DELTA',
				name: 'delta',
				ordering: 4,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#CEE0F4'
			},
			{
				key: 'THETA',
				name: 'theta',
				ordering: 5,
				btnclass : {
					inactive: 'btn-default',
					active: 'btn-primary'
				},
				color: '#FFDE99'
			}
		];

		var typeDictionary = resourceDictionary(
			'type',
			function (type) {
				return type.key;
			}
		);
		typeDictionary.setItems(Tasks.typeDef);

		Tasks.prototype.getTypeDef = function (type) {
			type = type || this.type;
			return typeDictionary.lookUpItem(type) || {color: '#AE4A32'};
		};

		/**************************************************
		 * Foreign key map definitions
		 * Will be moved to persistence later
		 *
		 * Only overriding foreign key map for users
		 **************************************************/
		Tasks.foreignKeyMap.setList({
			users: {
				default: 'assignedUserId'
			}
		}, true);

		/**************************************************
		 * Tasks vs Backlog Items
		 **************************************************/
		Tasks.forProductBacklogItem = function (productBacklogItem, successcb, errorcb) {
			// return Tasks.forResource('productbacklog', productBacklogItem.$id(), successcb, errorcb);

			return Tasks.query({productBacklogItem:productBacklogItem}, successcb, errorcb);
		};

		Tasks.forProductBacklogItemId = function (productBacklogItemId, successcb, errorcb) {
			return Tasks.forResource('productbacklog', productBacklogItemId, successcb, errorcb);
			// return Tasks.query({productBacklogItemId:productBacklogItemId}, successcb, errorcb);
		};

		// Tasks.forProductBacklogItemIdList = function (productBacklogItemIdList, successcb, errorcb) {
		// 	return Tasks.query({productBacklogItemId:{$in:productBacklogItemIdList}}, successcb, errorcb);
		// };

		Tasks.forProductBacklogItemIdList = function (productBacklogItemsOrIds, successcb, errorcb) {
			return Tasks.forResourceList('productbacklog', productBacklogItemsOrIds, successcb, errorcb);
		};


		/**************************************************
		 * Tasks vs Sprints
		 **************************************************/
		// Tasks.forSprint = function (sprintId, successcb, errorcb) {
		// 	return Tasks.query({sprintId:sprintId}, successcb, errorcb);
		// };

		Tasks.forSprint = function (sprintId, successcb, errorcb) {
			return Tasks.forResource('sprints', sprintId, successcb, errorcb);
		};

		Tasks.setSprint = function (tasksOrIds, sprintId, successcb, errorcb) {
			return Tasks.updateMultipleItems(
				tasksOrIds,
				{$set: {sprintId: sprintId}},
				successcb,
				errorcb
			);
		};

		Tasks.clearSprint = function (tasksOrIds, successcb, errorcb) {
			return Tasks.updateMultipleItems(
				tasksOrIds,
				{$unset: {sprintId: ""}},
				successcb,
				errorcb
			);
		};

		/**************************************************
		 * Tasks vs User
		 **************************************************/
		Tasks.forUser = function (userId, successcb, errorcb) {
			return Tasks.forResource('users', userId, successcb, errorcb);
			// return Tasks.query({assignedUserId:userId}, successcb, errorcb);
		};

		/**************************************************
		 * Tasks vs Project
		 **************************************************/
		Tasks.forProject = function (projectId, successcb, errorcb) {
			return Tasks.forResource('projects', projectId, successcb, errorcb);
			// return Tasks.query({projectId:projectId}, successcb, errorcb);
		};

		return Tasks;
	}
]);