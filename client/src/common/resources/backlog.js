angular.module('resources.productbacklog', ['webappResource']);
angular.module('resources.productbacklog').factory('ProductBacklog', ['webappResource', function (webappResource) {

  var ProductBacklog = webappResource('productbacklog');

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
