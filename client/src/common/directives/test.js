angular.module('directives.test', [
])

.directive('hello', function() {
	return {
		restrict : 'E',
		replace : true,
		// template : '<img id="map" src="http://www.lonelyplanet.com/maps/asia/india/map_of_india.jpg"  />',
		templateUrl: 'directives/hello.tpl.html',
		scope : {
			foobar : '@?',
			foobardata : '=',
			foobarfun : '&'
		},
		controller: [
			'$scope',
			'$element',
			'$attrs',
			'$timeout',
			function ($scope, $element, $attrs, $timeout) {
				// $scope.foobar = $scope.foobar || "foobar has risen from the ashes";
				$timeout(function () {
					$scope.foobar = "foobar has risen from the ashes";
				}, 7000);

				$timeout(function () {
					$scope.foobardata = "foobar has risen from the ashes by the data binding";
				}, 10000);

			}
		],
		link: function(scope, element, attrs) {
			console.log("linking the directive");
			scope.hello = 'and this is what i am saying';
			scope.hello2 = scope.foobarfun({message : 'new mundo finally man this is the limit'});


			// $('#map').click(function(e) {
			// 	$('#marker').css('left', e.pageX).css('top', e.pageY)
			// 	.show();
			// });
		}
	};
})

// A directive to display a paginated, searchable and sortable table
// give the list of items, items per page, and resource name
// .directive('tableactive', [
// 	'paginationFilter',
// 	function(
// 		paginationFilter
// 	) {
// 		return {
// 			restrict: 'E',
// 			templateUrl: 'directives/tableactive.tpl.html',
// 			// template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
// 			replace: true,
// 			scope: {
// 				resource: '@',
// 				items: '=',
// 				itemsperpage: '=',
// 				tablecolumns: '=',
// 				fetchingitems: '=',
// 				itemscrudhelpers: '='
// 			},
// 			link: function(scope, element, attrs) {
// 				console.log("LINKING THE TABLEACTIVE!!!!");
// 				scope.currentPage = 1;
// 				scope.itemsSort = {
// 					sortField : "priority",
// 					reverse : true,
// 					sort : function(fieldname) {
// 						if( this.sortField === fieldname){
// 							this.reverse = !this.reverse;
// 						}
// 						else {
// 							this.sortField = fieldname;
// 							this.reverse = false;
// 						}
// 					},
// 					isSortDown : function(fieldname) {
// 						return (this.sortField === fieldname) && this.reverse;
// 					},
// 					isSortUp : function(fieldname) {
// 						return (this.sortField === fieldname) && !this.reverse;
// 					}

// 				};

// 				// scope.options = {};
// 				// scope.$watch('email', function(email) {
// 				// 	if ( email ) {
// 				// 		scope.hash = md5(email.trim().toLowerCase());
// 				// 	}
// 				// });
// 				// scope.$watch('size', function(size) {
// 				// 	scope.options.s = (angular.isNumber(size)) ? size : undefined;
// 				// 	generateParams();
// 				// });
// 				// scope.$watch('forceDefault', function(forceDefault) {
// 				// 	scope.options.f = forceDefault ? 'y' : undefined;
// 				// 	generateParams();
// 				// });
// 				// scope.$watch('defaultImage', function(defaultImage) {
// 				// 	scope.options.d = defaultImage ? defaultImage : undefined;
// 				// 	generateParams();
// 				// });
// 				// function generateParams() {
// 				// 	var options = [];
// 				// 	scope.getParams = '';
// 				// 	angular.forEach(scope.options, function(value, key) {
// 				// 		if ( value ) {
// 				// 			options.push(key + '=' + encodeURIComponent(value));
// 				// 		}
// 				// 	});
// 				// 	if ( options.length > 0 ) {
// 				// 		scope.getParams = '?' + options.join('&');
// 				// 	}
// 				// }
// 			}
// 		};
// 	}
// ])
