angular.module('directives.tableactive', [
	'ui.bootstrap',
	'filters.pagination'
])

// A directive to display a paginated, searchable and sortable table
// give the list of items, items per page, and resource name
.directive('tableactive', [
	'paginationFilter',
	function(
		paginationFilter
	) {
		return {
			restrict: 'E',
			templateUrl: 'directives/tableactive.tpl.html',
			// template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
			replace: true,
			scope: {
				resourceconf: '=',
				items: '=',
				fetchingitems: '='
			},
			link: function(scope, element, attrs) {
				console.log("LINKING THE TABLEACTIVE!!!!");
				var conf = scope.resourceconf;
				scope.currentPage = conf.pagination.currentPage;
				scope.itemsPerPage = conf.pagination.itemsPerPage;
				scope.itemsCrudHelpers = conf.resource.itemsCrudHelpers;

				scope.rootDivClass = conf.resource.rootDivClass;
				scope.manageResources = conf.resource.link;
				scope.resourcePrettyName = conf.resource.prettyName;
				scope.resourcePrettyNameAlt = conf.resource.altPrettyName;
				scope.tableColumns = conf.tableColumns;

				scope.itemsSort = {
					sortField : conf.sortinit.fieldKey,
					reverse : conf.sortinit.reverse,
					sort : function(fieldname) {
						if( this.sortField === fieldname){
							this.reverse = !this.reverse;
						}
						else {
							this.sortField = fieldname;
							this.reverse = false;
						}
					},
					isSortDown : function(fieldname) {
						return (this.sortField === fieldname) && this.reverse;
					},
					isSortUp : function(fieldname) {
						return (this.sortField === fieldname) && !this.reverse;
					}
				};
			}
		};
	}
])
