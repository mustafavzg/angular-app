angular.module('services.crud', ['services.crudRouteProvider']);
angular.module('services.crud').factory('crudEditMethods', function () {

	return function (itemName, item, formName, successcb, errorcb) {

		var mixin = {};

		mixin[itemName] = item;
		mixin[itemName+'Copy'] = angular.copy(item);

		mixin.save = function () {
			this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
		};

		mixin.canSave = function () {
			return this[formName].$valid && !angular.equals(this[itemName], this[itemName+'Copy']);
		};

		mixin.revertChanges = function () {
			this[itemName] = angular.copy(this[itemName+'Copy']);
		};

		mixin.canRevert = function () {
			return !angular.equals(this[itemName], this[itemName+'Copy']);
		};

		mixin.remove = function () {
			if (this[itemName].$id()) {
				this[itemName].$remove(successcb, errorcb);
			} else {
				successcb();
			}
		};

		mixin.canRemove = function() {
			return item.$id();
		};

		/**
		 * Get the CSS classes for this item, to be used by the ng-class directive
		 * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
		 * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
		 */
		mixin.getCssClasses = function(fieldName) {
			var ngModelController = this[formName][fieldName];
			return {
				error: ngModelController.$invalid && ngModelController.$dirty,
				success: ngModelController.$valid && ngModelController.$dirty
			};
		};

		/**
		 * Whether to show an error message for the specified error
		 * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
		 * @param  {string} error - The name of the error as given by a validation directive
		 * @return {Boolean} true if the error should be shown
		 */
		mixin.showError = function(fieldName, error) {
			return this[formName][fieldName].$error[error];
		};

		return mixin;
	};
});

angular.module('services.crud').factory('crudEditHandlers', function () {

	return function (notificationKey) {

		var mixin = {};

		if( angular.isUndefined(notificationKey) ){
			return mixin;
		}

		mixin.onSave = function (item) {
			return {
				key: 'crud.' + notificationKey + '.save.success',
				type: 'success',
				context: {id : item.$id()}
			};
			// i18nNotifications.pushForNextRoute('crud.backlog.save.success', 'success', {id : item.$id()});
			console.log("item saved is");
			console.log(item);
			// locationHistory.prev();
		};

		mixin.onSaveError = function (error) {
			return {
				key: 'crud.' + notificationKey + '.save.error',
				type: 'error',
				context: {
					error: error
				}
			};
			// i18nNotifications.pushForCurrentRoute('crud.backlog.save.error', 'error');
			// mixin.updateError = true;
		};

		mixin.onUpdate = function (item) {
			return {
				key: 'crud.' + notificationKey + '.update.success',
				type: 'success',
				context: {id : item.$id()}
			};
			// i18nNotifications.pushForNextRoute('crud.backlog.update.success', 'success', {id : item.$id()});
			console.log("item updated is");
			console.log(item);
			// locationHistory.prev();
		};

		mixin.onUpdateError = function (error) {
			return {
				key: 'crud.' + notificationKey + '.update.error',
				type: 'error',
				context: {
					error: error
				}
			};
			// i18nNotifications.pushForCurrentRoute('crud.backlog.update.error', 'error');
			// mixin.updateError = true;
		};

		mixin.onRemove = function (item) {
			console.log("removing backlog");
			console.log(item);
			var context = angular.extend({}, item, {id : item.$id()});
			return {
				key: 'crud.' + notificationKey + '.remove.success',
				type: 'success',
				// context: {id : item.$id()}
				context: context
			};

			// var projectId = $route.current.params.projectId;
			// var taskid = task.$id();
			// $location.path('/projects/' + projectId + '/tasks');
		};

		mixin.onRemoveError = function (error) {
			return {
				key: 'crud.' + notificationKey + '.remove.error',
				type: 'error',
				context: {
					error: error
				}
			};
		};

		return mixin;
	};
});

angular.module('services.crud').factory('crudListMethods', [
	'$location',
	function ($location) {
		return function (pathPrefix) {
			var basePath = "/hive"
			var mixin = {};

			var returnOrSetRoute = function (route, returnRoute) {
				if( returnRoute ){
					return basePath + route;
				}
				return $location.path(route);
			};

			mixin['new'] = function (returnRoute) {
				// console.log("CALLIN NEW:"+pathPrefix+'/new');
				// $location.path(pathPrefix+'/new');
				return returnOrSetRoute(pathPrefix+'/new', returnRoute);
			};

			mixin['view'] = function (itemId, returnRoute) {
				if( angular.isDefined(itemId) ){
					// console.log('CALLING VIEW  '+pathPrefix+'/'+itemId+'/view');
					// $location.path(pathPrefix+'/'+itemId+'/view');
					return returnOrSetRoute(pathPrefix+'/'+itemId+'/view', returnRoute);
				}
				else {
					// console.log('CALLING VIEW  '+pathPrefix);
					// $location.path(pathPrefix);
					return returnOrSetRoute(pathPrefix, returnRoute);
				}
			};

			mixin['edit'] = function (itemId, returnRoute) {
				// $location.path(pathPrefix+'/'+itemId+'/edit');
				return returnOrSetRoute(pathPrefix+'/'+itemId+'/edit', returnRoute);
			};

			return mixin;
		};
	}
]);