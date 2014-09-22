angular.module('resources.sprints', [
	'webappResource',
	'moment'
]);
angular.module('resources.sprints').factory('Sprints', [
	'webappResource',
	'moment',
	function (webappResource, moment) {

		var Sprints = webappResource('sprints');
		Sprints.forProject = function (projectId, successcb, errorcb) {
			return Sprints.query({projectId:projectId}, successcb, errorcb);
		};
		Sprints.getSprint = function (sprintId, successcb, errorcd){
			return Sprints.query({sprintId:sprintId}, successcb, errorcb);
		};

		Sprints.prototype.isExpired = function () {
			var today = moment(new Date());
			var sprintEnd = moment(this.enddate);
			return (today.isSame(sprintEnd) || today.isAfter(sprintEnd))? true : false;
		};

		Sprints.prototype.isActive = function () {
			var today = moment(new Date());
			var sprintStart = moment(this.startdate);
			var sprintEnd = moment(this.enddate);
			return (today.isSame(sprintStart)
				  || (today.isAfter(sprintStart) && today.isBefore(sprintEnd)))? true : false;
		};

		Sprints.prototype.isPlanned = function () {
			var today = moment(new Date());
			var sprintStart = moment(this.startdate);
			return (today.isBefore(sprintStart))? true : false;
		};

		Sprints.statusDef = [
			{
				key: 'PLANNED',
				name: 'Planned',
				ordering: 1,
				predicate: Sprints.prototype.isPlanned
			},
			{
				key: 'ACTIVE',
				name: 'Active',
				ordering: 2,
				predicate: Sprints.prototype.isActive
			},
			{
				key: 'EXPIRED',
				name: 'Expired',
				ordering: 3,
				predicate: Sprints.prototype.isExpired
			}
		];

		Sprints.prototype.getStatus = function () {
			var that = this;
			var status = {};
			for(var i = -1; ++i < Sprints.statusDef.length;){
				if( Sprints.statusDef[i].predicate.apply(that) ){
					status = Sprints.statusDef[i];
					break;
				}
			}
			// angular.forEach(Sprints.statusDef, function(statusref) {
			// 	if( statusref.predicate.apply(that) ){
			// 		status = statusref;
			// 	}
			// });
			return status;
		};

		Sprints.prototype.getStatusPretty = function () {
			var status = this.getStatus();
			return status.name;
		};

		Sprints.prototype.getStatusKey = function () {
			var status = this.getStatus();
			return status.key;
		};

		Sprints.prototype.getBacklogItems = function () {
			return this.sprintBacklog;
		};
		return Sprints;
	}
]);