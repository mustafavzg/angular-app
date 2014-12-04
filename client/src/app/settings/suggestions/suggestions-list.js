angular.module('suggestions-list', [
  'services.crud',
  'services.i18nNotifications'
])

.controller('SuggestionsListCtrl', [
	'$scope',
	'crudListMethods',
	'suggestions',
	'i18nNotifications',
	function ($scope, crudListMethods, suggestions, i18nNotifications) {
		$scope.suggestions = suggestions;

		$scope.userscrudhelpers = {};
		angular.extend($scope, crudListMethods('/suggestions'));


		$scope.remove = function(suggestion, $index, $event) {
			// Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
			// an edit of this item.
			$event.stopPropagation();


			// Remove this suggestion
			suggestion.$remove(function() {
				// It is gone from the DB so we can remove it from the local list too
				$scope.suggestions.splice($index,1);
				i18nNotifications.pushForCurrentRoute('crud.suggestion.remove.success', 'success', {id : suggestion.$id()});
				}, function() {
				   i18nNotifications.pushForCurrentRoute('crud.suggestion.remove.error', 'error', {id : suggestion.$id()});
			});
		};
	}
]);
