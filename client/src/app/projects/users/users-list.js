angular.module('users-list', [
  'services.crud',
  'services.i18nNotifications'
])

.controller('UsersListCtrl', [
	'$scope',
	'crudListMethods',
	'users',
	'i18nNotifications',
	'projectId',
	function ($scope, crudListMethods, users, i18nNotifications, projectId) {
		$scope.users = users;
		console.log(users);

		$scope.userscrudhelpers = {};
		angular.extend($scope, crudListMethods('/projects/'+projectId+'/users'));


		$scope.remove = function(user, $index, $event) {
			// Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
			// an edit of this item.
			$event.stopPropagation();


			// Remove this user
			user.$remove(function() {
				// It is gone from the DB so we can remove it from the local list too
				$scope.users.splice($index,1);
				i18nNotifications.pushForCurrentRoute('crud.user.remove.success', 'success', {id : user.$id()});
			}, function() {
				   i18nNotifications.pushForCurrentRoute('crud.user.remove.error', 'error', {id : user.$id()});
			   });
		};
	}
]);
