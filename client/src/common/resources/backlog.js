angular.module('resources.productbacklog', ['dbResource']);
angular.module('resources.productbacklog').factory('ProductBacklog', ['dbResource', function (dbResource) {

  var ProductBacklog = dbResource('productbacklog');

  ProductBacklog.getCollectionName = function(){
    return 'productbacklog';    
  };
   
  ProductBacklog.forProject = function (projectId, successcb, errorcb) {
    return ProductBacklog.forResource('projects', projectId, successcb, errorcb);
  };

  ProductBacklog.forSprint = function (sprintId, successcb, errorcb) {
    return ProductBacklog.forResource('sprints', sprintId, successcb, errorcb);
  };

  return ProductBacklog;
}]);
