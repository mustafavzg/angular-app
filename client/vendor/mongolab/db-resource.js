angular.module('dbResource', ['mongolabResource', 'athenawebappResource'])

.factory('dbResource', [
	'DB_CONFIG',
	'mongolabResource',
	'athenawebappResource',
	function (DB_CONFIG, mongolabResource, athenawebappResource) {
		function dbResourceFactory(collectionName) {
 			// console.log("inside here:DB_CONFIG=");
			// console.log(DB_CONFIG);
			if(DB_CONFIG.isDevNet){
 				console.log("Initializing athenawebappResource...");
				console.log("collection name: "+collectionName);
				return athenawebappResource(collectionName);
			}
			else{
				// console.log("Initializing mongolabResource...");
				// console.log("collection name: "+collectionName);
				return mongolabResource(collectionName);
			}
		}
		return dbResourceFactory;
	}
]);