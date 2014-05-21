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

		var roles = {
			PO: {
				name: 'Product Owner',
				description: 'Product owner is responsible for creating new requirements in the backlog',
				icon: 'glyphicon glyphicon-tower',
				ordering: 1
			},
			SH: {
				name: 'Stake Holder',
				description: 'Stake Holder like product owner is responsible for creating new requirements in the backlog',
				icon: 'glyphicon glyphicon-header',
				ordering: 2
			},
			SM: {
				name: 'Scrum Master',
				description: 'Scrum Master is responsible to manage the resources to achieve the sprint objectives',
				icon: 'glyphicon glyphicon-eye-open',
				ordering: 3
			},
			TM: {
				name: 'Team Member',
				description: 'Team member works on the tasks assigned',
				icon: 'glyphicon glyphicon-user',
				ordering: 4
			}
		};

		// Projects.prototype.getUserRoles = function (userId) {
		Projects.prototype.getUserRoles = function (user) {
			var userRoles = [];
			if( angular.isDefined(user) ){
				var userId = user.$id();
				// console.log("USERID is " + userId);
				if ( this.isProductOwner(userId) ) {
					userRoles.push(roles['PO']);
				}
				else if ( this.isStakeHolder(userId) ) {
					userRoles.push(roles['SH']);
				}
				else {
					if (this.isScrumMaster(userId)){
						userRoles.push(roles['SM']);
					}
					if (this.isDevTeamMember(userId)){
						userRoles.push(roles['TM']);
					}
				}
			}
			return userRoles;
		};

		return Projects;
	}
]);