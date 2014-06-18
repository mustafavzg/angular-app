angular.module('directives.crud.buttons', [
	'directives.icon'
])

.directive('crudButtons', function () {
	return {
		restrict:'E',
		replace:true,
		scope:true,
		require: '^form',
		templateUrl: 'directives/crud/crudButtons.tpl.html',
		link: function(scope, element, attrs, form) {
			scope.isOpen = false;
			console.log("checking for the save dropdwon");
			console.log(scope);
		}
		// template:
		// '<div>' +
		// 	'  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()"><icon id="save"></icon> Save</button>' +
		// 	'  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()"><icon id="repeat"></icon> Revert changes</button>'+
		// 	'  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()"><icon id="trash"></icon> Remove</button>'+
		// 	'</div>'
	};
});
