angular.module('suggestions', [
  'suggestions-list',
  'suggestions-edit',
  'services.crud',
  'security.authorization',
  'resources.suggestions'
])

.config([
	'crudRouteProvider',
	'$routeProvider',
	'securityAuthorizationProvider',
	function (crudRouteProvider, $routeProvider, securityAuthorizationProvider) {

		$routeProvider.when('/suggestions/new', {
			templateUrl:'settings/suggestions/suggestions-edit.tpl.html',
			controller:'SuggestionsEditCtrl',
			resolve:{
				suggestion: ['Suggestions', function(Suggestions) { return new Suggestions(); }]
			}
		});

		$routeProvider.when('/suggestions/list', {
			templateUrl:'settings/suggestions/suggestions-list.tpl.html',
			controller:'SuggestionsListCtrl',
			resolve:{
				suggestions: [
					'Suggestions',
					function(Suggestions) {
						return Suggestions.all();
					}
				]
			}
		});


	}
]);