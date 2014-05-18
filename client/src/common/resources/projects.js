angular.module('resources.projects', ['mongolabResource']);
angular.module('resources.projects')
.factory('Projects', [
	'mongolabResource',
	function ($mongolabResource) {

		var Projects = $mongolabResource('projects');

		Projects.forUser = function(userId, successcb, errorcb) {
			return Projects.query({
				$or: [
					{ teamMembers: userId },
					{ productOwner: userId },
					{ scrumMaster: userId },
					{ stakeholders: userId }
				]
			}, successcb, errorcb);
		};

		Projects.prototype.isProductOwner = function (userId) {
			return this.productOwner === userId;
		};
		Projects.prototype.canActAsProductOwner = function (userId) {
			return !this.isScrumMaster(userId) && !this.isDevTeamMember(userId);
			// return this.isStakeHolder(userId) && !this.isScrumMaster(userId) && !this.isDevTeamMember(userId);
		};

		Projects.prototype.isScrumMaster = function (userId) {
			return this.scrumMaster === userId;
		};
		Projects.prototype.canActAsScrumMaster = function (userId) {
			return !this.isProductOwner(userId) && !this.isStakeHolder(userId);
		};

		Projects.prototype.isStakeHolder = function (userId) {
			return this.stakeHolders.indexOf(userId) >= 0;
		};
		Projects.prototype.canActAsStakeHolder = function (userId) {
			return (!this.isScrumMaster(userId) && !this.isDevTeamMember(userId)
			);
		};

		Projects.prototype.isDevTeamMember = function (userId) {
			return this.teamMembers.indexOf(userId) >= 0;
		};
		Projects.prototype.canActAsDevTeamMember = function (userId) {
			return !this.isProductOwner(userId) && !this.isStakeHolder(userId);
		};

		Projects.prototype.getRoles = function (userId) {
			console.log("USERID is " + userId);
			var roles = [];
			if (this.isProductOwner(userId)) {
				roles.push('PO');
			} else {
				if (this.isScrumMaster(userId)){
					roles.push('SM');
				}
				if (this.isDevTeamMember(userId)){
					roles.push('DEV');
				}
			}
			return roles;
		};

		return Projects;
	}
]);