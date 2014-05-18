angular.module('projectsinfo', [
	'underscore'
]);

angular.module('projectsinfo').config([
	'$routeProvider',
	function(
		$routeProvider
	) {
		$routeProvider.when('/projectsinfo', {
			templateUrl:'projectsinfo/list.tpl.html',
			controller:'ProjectsInfoListCtrl',
			resolve:{
				projects:[
					'Projects',
					function(Projects){
						return Projects.all();
					}
				]
			}
		});
	}
]);

angular.module('projectsinfo').controller('ProjectsInfoListCtrl',[
	'$scope',
	'projects',
	'_',
	function(
		$scope,
		projects,
		_
	) {
		$scope.projects = projects;
		$scope.previousproject = undefined;

		// Setup showDescription
		_.each(projects, function(project){
			project.showDescription = false;
		});

		// Display Description
		$scope.displayDescription = function(project){
			project.showDescription = true;
			// if( !_.isUndefined($scope.previousproject) ){
			//	$scope.previousproject.showDescription = false;
			// }
			// $scope.previousproject = project;
		};

		$scope.hideDescription = function(project){
			project.showDescription = false;
		};

		// Toggle description
		$scope.toggleDescription = function(project){
			project.showDescription = !project.showDescription;
			if( project.showDescription ){
				if( !_.isUndefined($scope.previousproject) ){
					$scope.previousproject.showDescription = false;
				}
				$scope.previousproject = project;
			}
			else {
				$scope.previousproject = undefined;
			}
		};
	}
]);
