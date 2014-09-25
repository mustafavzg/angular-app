angular.module('resources.productbacklog', ['dbResource']);
angular.module('resources.productbacklog').factory('ProductBacklog', ['dbResource', function (dbResource) {

  var ProductBacklog = dbResource('productbacklog');

  ProductBacklog.getCollectionName = function(){
    return 'productbacklog';    
  };
   
  ProductBacklog.forProject = function (projectId, successcb, errorcb) {
    return ProductBacklog.query({projectId:projectId}, successcb, errorcb);
  };

  ProductBacklog.forSprint = function (sprintId, successcb, errorcb) {
  	console.log("Inside Product Backlog for sprint=");
  	console.log(ProductBacklog.query({sprintId:sprintId}, successcb, errorcb));
    return ProductBacklog.query({sprintId:sprintId}, successcb, errorcb);
  };

  return ProductBacklog;
}]);
