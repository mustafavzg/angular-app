angular.module('suggestions-edit',[
  'services.crud',
  'services.i18nNotifications',
  'suggestions-edit-uniqueEmail',
  'suggestions-edit-validateEquals'
])

.controller('suggestionsEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	'suggestion',
	'crudListMethods',
	'projectId',
	function ($scope, $location, i18nNotifications, suggestion, crudListMethods, projectId) {

		$scope.suggestion = suggestion;
		console.log(suggestion);
		$scope.suggestionscrudhelpers = {};
		angular.extend($scope.suggestionscrudhelpers, crudListMethods('/projects/'+projectId+'/suggestions'));


		// $scope.password = suggestion.password;

		$scope.onSave = function (suggestion) {
			i18nNotifications.pushForNextRoute('crud.suggestion.save.success', 'success', {id : suggestion.$id()});
			$location.path('/suggestions');
		};

		$scope.onError = function() {
			i18nNotifications.pushForCurrentRoute('crud.suggestion.save.error', 'error');
		};

		$scope.onRemove = function(suggestion) {
			i18nNotifications.pushForNextRoute('crud.suggestion.remove.success', 'success', {id : suggestion.$id()});
			$location.path('/suggestions');
		};

	}
]);