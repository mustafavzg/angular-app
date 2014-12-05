angular.module('suggestions-edit',[
  'services.crud',
  'services.i18nNotifications'
])

.controller('SuggestionsEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	'Suggestions',
	'suggestion',
	'crudListMethods',
	'crudEditHandlers',
	function ($scope, $location, i18nNotifications, Suggestions, suggestion, crudListMethods, crudEditHandlers) {
		$scope.suggestion = suggestion;
		console.log("suggestion object is:\n");
		console.log(Suggestions);
		$scope.userscrudhelpers = {};
		angular.extend($scope.userscrudhelpers, crudListMethods('/suggestions'));
		angular.extend($scope, crudEditHandlers('suggestion'));
		console.log("Inside suggestions controller.");
		$scope.statuses = ["Bug", "Feature"];
		$scope.onSave = function (suggestion) {
			i18nNotifications.pushForNextRoute('crud.suggestion.save.success', 'success', {id : suggestion.$id()});
			var suggestionResource = new Suggestions($scope.suggestion);
			var successcb = function(){
				console.log("Suggestion saved successfully.");
			};
			var failurecb = function(){
				console.log("Suggestion saving failed.");
			};
			suggestionResource.$save(successcb, failurecb);
			$location.path('/suggestions/list');
		};

		$scope.onError = function() {
			i18nNotifications.pushForCurrentRoute('crud.suggestion.save.error', 'error');
		};

		$scope.onRemove = function(suggestion) {
			i18nNotifications.pushForNextRoute('crud.suggestion.remove.success', 'success', {id : suggestion.$id()});
			$location.path('/suggestions/list');
		};

	}
]);