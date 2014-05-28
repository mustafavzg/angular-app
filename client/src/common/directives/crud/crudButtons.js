angular.module('directives.crud.buttons', [
	'directives.icon'
])

.directive('crudButtons', function () {
  return {
    restrict:'E',
    replace:true,
    template:
      '<div>' +
      '  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()"><icon id="save"></icon> Save</button>' +
      '  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()"><icon id="repeat"></icon> Revert changes</button>'+
      '  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()"><icon id="trash"></icon> Remove</button>'+
      '</div>'
  };
		  // '<button type="button" class="btn btn-primary" ng-click="showMe()">Show Me</button>'+
});
