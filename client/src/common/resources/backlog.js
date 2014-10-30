angular.module('resources.productbacklog', ['dbResource']);
angular.module('resources.productbacklog').factory('ProductBacklog', ['dbResource', function (dbResource) {

  var ProductBacklog = dbResource('productbacklog');

  ProductBacklog.getCollectionName = function(){
    return 'productbacklog';    
  };
   
  ProductBacklog.forProject = function (projectId, successcb, errorcb) {
    return ProductBacklog.forResource('projects', successcb, errorcb);
  };

  ProductBacklog.forSprint = function (sprintId, successcb, errorcb) {
    return ProductBacklog.forResource('sprints', successcb, errorcb);
  };

  return ProductBacklog;
}]);
