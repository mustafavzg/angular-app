angular.module('workflows-list', [
  'services.crud',
  'services.i18nNotifications'
])

.controller('WorkflowsListCtrl', [
	'$scope',
	'crudListMethods',
	'workflows',
	'i18nNotifications',
	function ($scope, crudListMethods, workflows, i18nNotifications) {
		$scope.workflows = workflows;

		$scope.userscrudhelpers = {};
		angular.extend($scope, crudListMethods('/workflows'));


		$scope.remove = function(workflow, $index, $event) {
			// Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
			// an edit of this item.
			$event.stopPropagation();


			// Remove this workflow
			workflow.$remove(function() {
				// It is gone from the DB so we can remove it from the local list too
				$scope.workflows.splice($index,1);
				i18nNotifications.pushForCurrentRoute('crud.workflow.remove.success', 'success', {id : workflow.$id()});
				}, function() {
				   i18nNotifications.pushForCurrentRoute('crud.workflow.remove.error', 'error', {id : workflow.$id()});
			});
		};
	}
]);
