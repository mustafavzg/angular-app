angular.module('directives.crud.edit', [
	'services.i18nNotifications',
	'services.locationHistory'
])

// Apply this directive to an element at or below a form that will manage CRUD operations on a resource.
// - The resource must expose the following instance methods: $saveOrUpdate(), $id() and $remove()
.directive('crudEdit', ['$parse', function($parse) {
  return {

    // This directive appears as an attribute
    scope: true,
    require: '^form',
	controller: [
		'$scope',
		'$location',
		'$route',
		'i18nNotifications',
		'locationHistory',
		function ($scope, $location, $route, i18nNotifications, locationHistory) {
			// $scope.locationHistory = locationHistory;
			$scope.crudRouteChange = function (path) {
				$location.path(path);
			};
			var current = $location.$$path;
			var routeTokens = current.split("/");

			$scope.backToItemView = function (savedItem, notification) {
				var lastToken = routeTokens.slice(-1)[0];
				var nextRouteTokens = routeTokens.slice(0, -1);
				if( lastToken === "new" ){
					nextRouteTokens.push(savedItem.$id());
					nextRouteTokens.push('view');
				}
				if( angular.isDefined(notification) ){
					i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
				}

				$location.path(nextRouteTokens.join("/"));
			};

			$scope.skipItemView = function (notification) {
				var prevPath = locationHistory.getPrev();
				if( angular.isDefined(prevPath) ){
					var prevPathTokens = prevPath.split("/");
					var prevPathLastToken = prevPathTokens.slice(-1)[0];
					if( prevPathLastToken === 'view' ){
						var currentPathItem = routeTokens.slice(-3, -1);
						var prevPathItem = prevPathTokens.slice(-3, -1);
						if( angular.equals(currentPathItem, prevPathItem) ){
							locationHistory.prev(true, true);
						}
					}
					if( angular.isDefined(notification) ){
						i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
					}
					locationHistory.prev(false, true);
				}
				else {
					if( angular.isDefined(notification) ){
						i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					}
					locationHistory.loadCurrent();
				}
			};

			$scope.backToPrevRoute = function (notification) {
				var prevPath = locationHistory.getPrev();
				if( angular.isDefined(prevPath) ){
					var prevPathTokens = prevPath.split("/");
					var prevPathLastToken = prevPathTokens.slice(-1)[0];
					if( prevPathLastToken === 'edit' ){
						locationHistory.prev(true, true);
						$scope.backToPrevRoute(notification);
					}
					else {
						if( angular.isDefined(notification) ){
							i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
						}
						locationHistory.prev(false, true);
					}
				}
				else {
					if( angular.isDefined(notification) ){
						i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
					}
					locationHistory.loadCurrent();
				}
				// if( prevPathLastToken === 'edit' ){
				// 	locationHistory.prev(true);
				// 	$scope.backToPrevRoute(notification);
				// }
				// else {
				// 	if( angular.isDefined(notification) ){
				// 		i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
				// 	}
				// 	locationHistory.prev();
				// }
			};

			$scope.toNextItemRoute = function (notification) {
				var lastToken = routeTokens.slice(-1)[0];
				var nextRouteTokens;
				if( lastToken === "new" ){
					// if a new item was created
					nextRouteTokens = routeTokens;
					if( angular.isDefined(notification) ){
						i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
					}
				}
				else {
					// if we are on the item update screen
					nextRouteTokens = routeTokens.slice(0, -2);
					nextRouteTokens.push("new");
					if( angular.isDefined(notification) ){
						i18nNotifications.pushForNextRoute(notification.key, notification.type, notification.context);
					}
				}
				console.log("to next item tokens");
				console.log(nextRouteTokens);
				$location.path(nextRouteTokens.join("/"));
			};

			$scope.noRouteChange = function (notification) {
				if( angular.isDefined(notification) ){
					i18nNotifications.pushForCurrentRoute(notification.key, notification.type, notification.context);
				}
				// no change in location
			};

			$scope.nonCrudRouteChange = function (path) {
				if( $scope.canSave() ){
					i18nNotifications.pushForCurrentRoute('crud.unsaved', 'error', {});
				}
				else {
					$location.path(path);
				}
			};
			// make it available to the parent scope
			$scope.$parent.nonCrudRouteChange = $scope.nonCrudRouteChange;
		}
	],
    link: function(scope, element, attrs, form) {
		// We extract the value of the crudEdit attribute
		// - it should be an assignable expression evaluating to the model (resource) that is going to be edited
		var resourceGetter = $parse(attrs.crudEdit);
		var resourceSetter = resourceGetter.assign;
		// Store the resource object for easy access
		var resource = resourceGetter(scope);
		// Store a copy for reverting the changes
		var original = angular.copy(resource);

		var checkResourceMethod = function(methodName) {
			if ( !angular.isFunction(resource[methodName]) ) {
				throw new Error('crudEdit directive: The resource must expose the ' + methodName + '() instance method');
			}
		};
		checkResourceMethod('$saveOrUpdate');
		checkResourceMethod('$id');
		checkResourceMethod('$remove');

		// This function helps us extract the callback functions from the directive attributes
		var makeFn = function(attrName) {
			var fn = scope.$eval(attrs[attrName]);
			if ( !angular.isFunction(fn) ) {
				throw new Error('crudEdit directive: The attribute "' + attrName + '" must evaluate to a function');
			}
			return fn;
		};

		/**************************************************
		 * Save or Update item
		 **************************************************/
		// Save predicate
		scope.canSave = function() {
			return form.$valid && !angular.equals(resource, original);
		};
		// expose this on the parent scope
		// inorder to detect any unsaved changes
		// scope.$parent.canSave = scope.canSave;

		// Save functions for save dropdown button
		scope.save = function() {
			console.log("calling simple save");
			resource.$saveOrUpdate(onSave, onSave, onSaveError, onSaveError);
		};

		scope.saveAndBack = function() {
			console.log("calling save and back");
			resource.$saveOrUpdate(onSaveAndBack, onSaveAndBack, onSaveError, onSaveError);
		};

		scope.saveAndNext = function() {
			console.log("calling save and next");
			resource.$saveOrUpdate(onSaveAndNext, onSaveAndNext, onSaveError, onSaveError);
		};

		scope.saveAndStay = function() {
			console.log("calling save and stay");
			resource.$saveOrUpdate(onSaveAndStay, onSaveAndStay, onSaveError, onSaveError);
		};

		// Set up callbacks with fallback
		// onSave attribute -> onSave scope -> noop
		var userOnSave = attrs.onSave ? makeFn('onSave') : ( scope.onSave || angular.noop );

		// save and back to the item view
		var onSave = function(result, status, headers, config) {
			// Reset the original to help with reverting and pristine checks
			console.log("calling onSave");
			original = result;
			var notification = userOnSave(result, status, headers, config);
			scope.backToItemView(result, notification);
		};

		// save and back to the previous route
		var onSaveAndBack = function(result, status, headers, config) {
				// Reset the original to help with reverting and pristine checks
				console.log("calling on save and back");
				original = result;
				var notification = userOnSave(result, status, headers, config);
				scope.backToPrevRoute(notification);
			};

		// save and create another item
		var onSaveAndNext = function(result, status, headers, config) {
			// Reset the original to help with reverting and pristine checks
			console.log("calling on save and next");
			original = result;
			var notification = userOnSave(result, status, headers, config);
				scope.toNextItemRoute(notification);
		};

		// save and stay on the edit screen for further changes
		var onSaveAndStay = function(result, status, headers, config) {
			// Reset the original to help with reverting and pristine checks
			console.log("calling on save and stay");
			original = result;
			var notification = userOnSave(result, status, headers, config);
			scope.noRouteChange(notification);
		};


		// onSaveError attribute -> onSaveError scope -> noop
		var userOnSaveError = attrs.onSaveError ? makeFn('onSaveError') : ( scope.onSaveError || angular.noop )

		// Save Error Handler
		var onSaveError = function(result, status, headers, config) {
			console.log("save error occurred");
			var notification = userOnSaveError(result, status, headers, config);
			scope.noRouteChange(notification);
		};

		/**************************************************
		 * Revert changes
		 **************************************************/
		scope.revertChanges = function() {
 			resource = angular.copy(original);
			resourceSetter(scope.$parent, resource);
			// console.log("After reverting");
			// console.log(resourceGetter(scope));
			form.$setPristine();
		};

		scope.canRevert = function() {
			return !angular.equals(resource, original);
		};

		/**************************************************
		 * Remove item
		 **************************************************/

		// onRemove attribute -> onRemove scope -> onSave attribute -> onSave scope -> noop
		var userOnRemove = attrs.onRemove ? makeFn('onRemove') : ( scope.onRemove || onSave );
		// onError attribute -> onError scope -> noop
		var userOnRemoveError = attrs.onRemoveError ? makeFn('onRemoveError') : ( scope.onRemoveError || angular.noop );

		// remove and back to the item view
		var onRemove = function(result, status, headers, config) {
			console.log("calling on remove");
			var notification = userOnRemove(result, status, headers, config);
			scope.skipItemView(notification);
		};

		// remove and back to the item view
		var onRemoveError = function(result, status, headers, config) {
			console.log("calling on removeError");
			var notification = userOnRemoveError(result, status, headers, config);
			scope.noRouteChange(notification);
		};

		scope.remove = function() {
			if(resource.$id()) {
				resource.$remove(onRemove, onRemoveError);
			} else {
				onRemove();
			}
		};

		scope.canRemove = function() {
			return resource.$id();
		};

		/**
		 * Get the CSS classes for this item, to be used by the ng-class directive
		 * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
		 * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
		 */
		scope.getCssClasses = function(fieldName) {
			var ngModelController = form[fieldName];
			return {
				error: ngModelController.$invalid && !angular.equals(resource, original),
				success: ngModelController.$valid && !angular.equals(resource, original)
			};
		};
		/**
		 * Whether to show an error message for the specified error
		 * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
		 * @param  {string} error - The name of the error as given by a validation directive
		 * @return {Boolean} true if the error should be shown
		 */
		scope.showError = function(fieldName, error) {
			return form[fieldName].$error[error];
		};
    }
  };
}]);