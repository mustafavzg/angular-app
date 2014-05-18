angular.module('users-edit',[
  'services.crud',
  'services.i18nNotifications',
  'users-edit-uniqueEmail',
  'users-edit-validateEquals'
])

.controller('UsersEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	'user',
	'crudListMethods',
	'projectId',
	function ($scope, $location, i18nNotifications, user, crudListMethods, projectId) {

		$scope.user = user;
		console.log(user);
		$scope.userscrudhelpers = {};
		angular.extend($scope.userscrudhelpers, crudListMethods('/projects/'+projectId+'/users'));


		// $scope.password = user.password;

		$scope.onSave = function (user) {
			i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {id : user.$id()});
			$location.path('/users');
		};

		$scope.onError = function() {
			i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
		};

		$scope.onRemove = function(user) {
			i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : user.$id()});
			$location.path('/users');
		};

	}
]);