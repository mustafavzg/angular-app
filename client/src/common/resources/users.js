angular.module('resources.users', ['mongolabResource']);
angular.module('resources.users').factory('Users', [
	'mongolabResource',
	'filterFilter',
	function (mongoResource, filterFilter) {

		var userResource = mongoResource('users');

		userResource.autocomplete = function(query, successcb, errorcb) {
			// mongodb seems to accept only regex literals
			// so getting all users and using filter as temporary hack
			// var queryre = new RegExp(query);
			// return userResource.query(
			// 	{
			// 		$or: [
			// 			{ firstName: { $regex : queryre, $options: 'i' } },
			// 			{ lastName: { $regex : queryre, $options: 'i' } },
			// 			{ username: { $regex : queryre, $options: 'i' } }
			// 		]
			// 	}
			// 	// successcb,
			// 	// errorcb
			// ).then(
			// 	function (users) {
			// 		console.log(users);
			// 		return successcb(users);
			// 	},
			// 	function (response) {
			// 		return errorcb(response);
			// 	}
			// );

			// TO DO: setup backend for autocomplete
			return userResource.all().then(
				function (users) {
					console.log("filtering based on : " + query);
					users = filterFilter(
						users,
						query
						// function (user) {
						// 	var queryre = new RegExp(query);
						// 	return queryre.test(user.firstName);
						// }
					);
					console.log(users);
					return successcb(users);
				},
				function (response) {
					return errorcb(response);
				}
			);

		};

		userResource.prototype.getFullName = function () {
			// return this.lastName + " " + this.firstName + " (" + this.username + ")";
			return this.lastName + " " + this.firstName;
		};


		return userResource;
	}
]);
