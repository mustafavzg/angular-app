angular.module('workflows', [
  'workflows-list',
  'workflows-edit',
  'security.authorization',
  'resources.workflows'
])

.config([
	'crudRouteProvider',
	'$routeProvider',
	'securityAuthorizationProvider',
	function (crudRouteProvider, $routeProvider, securityAuthorizationProvider) {

		$routeProvider.when('/workflows/new', {
			templateUrl:'settings/workflows/workflows-edit.tpl.html',
			controller:'WorkflowsEditCtrl',
			resolve:{
				workflow: ['Workflows', function(Workflows) { return new Workflows(); }]
			}
		});

		$routeProvider.when('/workflows/list', {
			templateUrl:'settings/workflows/workflows-list.tpl.html',
			controller:'WorkflowsListCtrl',
			resolve:{
				workflows: [
					'Workflows',
					function(Workflows) {
						return Workflows.all();
					}
				]
			}
		});
	}
]);