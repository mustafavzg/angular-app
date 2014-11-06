angular.module('services.timeBursts', [
	'services.resourceDictionary',
	'underscore'
]);

angular.module('services.timeBursts').factory('timeBursts', [
	'resourceDictionary',
	'_',
	function (
		resourceDictionary,
		_
	) {

		var timeBurstsFactory = function (timeBursts) {
			var bursts = [];
			var timeBurstsService = function (timeBursts, args) {
				this.bursts = (angular.isArray(timeBursts))? timeBursts : bursts;

				// to clone or not to clone: check in the timer code
				// this.bursts = (angular.isArray(timeBursts))? _.clone(timeBursts) : bursts;
				if( angular.isObject(args) ){
					if( angular.isArray(args.lookUp) ){
						this.lookUp = {};
						angular.forEach(args.lookUp, function(lookUpAttr, index) {
							this.lookUp[lookUpAttr] = resourceDictionary(
								lookUpAttr,
								function (burst) {
									return (angular.isDefined(burst.data)) ? burst.data[lookUpAttr] : undefined;
								}
							);
							this.lookUp[lookUpAttr].setItems(this.bursts);
						});
					}
				}
			};

			timeBurstsService.prototype.push = function (burst) {
				if( angular.isObject(burst) ){
					this.bursts.push(burst);
				}
			};

			timeBurstsService.prototype.pop = function () {
				return this.bursts.pop();
			};

			timeBurstsService.prototype.getBursts = function () {
				// return this.bursts.slice(0);
				return _.clone(this.bursts);
			};

			timeBurstsService.prototype.sumBursts = function () {
				var burstTime = 0;
				angular.forEach(this.bursts, function(burst) {
					// console.log("calculating burst time");
					// console.log(burst);
					// console.log(burstTime);
					// console.log(burst.stop - burst.start);
					if( burst.stop ){
						burstTime += burst.stop - burst.start;
					}
				});
				return burstTime;
			};

			timeBurstsService.prototype.lastBurst = function () {
				return this.bursts.slice(-1)[0];
			};

			timeBurstsService.prototype.totalBurstTime = function () {
				return this.sumBursts();
			};

			timeBurstsService.prototype.timerRunning = function () {
				var lastBurst = this.lastBurst();
				return (lastBurst && !lastBurst.stop)? true : false;
			};

			return new timeBurstsService(timeBursts);
		};
		return timeBurstsFactory;
	}
]);