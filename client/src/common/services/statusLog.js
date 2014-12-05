angular.module('services.statusLog', [
	'services.resourceDictionary',
	'underscore',
	'moment'
]);

angular.module('services.statusLog').factory('statusLog', [
	'resourceDictionary',
	'_',
	'moment',
	function (
		resourceDictionary,
		_,
		moment
	) {

		var statusLogFactory = function (statusLog, args) {
			var logs = [];
			var statusLogService = function (statusLog, args) {
				this.logs = (angular.isArray(statusLog))? statusLog : logs;

				// to clone or not to clone: check in the timer code
				// this.logs = (angular.isArray(statusLog))? _.clone(statusLog) : logs;
				if( angular.isObject(args) ){
					if( angular.isArray(args.lookUp) ){
						this.lookUp = {};
						// lookup based on each attribute
						// status, username etc
						var that = this;
						angular.forEach(args.lookUp, function(lookUpAttr, index) {
							that.lookUp[lookUpAttr] = resourceDictionary(
								lookUpAttr,
								function (log) {
									return (angular.isDefined(log.data)) ? log.data[lookUpAttr] : undefined;
								}
							);
							that.lookUp[lookUpAttr].setItems(that.logs);
						});
					}
				}
			};

			statusLogService.prototype.push = function (log, lookUpKey) {
				if( angular.isObject(log) ){
					this.logs.push(log);
				}
				if( lookUpKey ){
 					this.lookUp[lookUpKey].setItem(log, 1);
				}
			};

			statusLogService.prototype.pop = function (lookUpKey) {
				var log = this.logs.pop();
				if( lookUpKey ){
					var lookUp = this.lookUp[lookUpKey];
 					var prevItem = lookUp.lookUpItem(log);
					if( prevItem && prevItem.start === log.start ){
 						lookUp.clearItem(log);
					}
				}
				return log;
			};


			statusLogService.prototype.getLookUp = function (lookUpKey) {
 				return this.lookUp[lookUpKey].getDictionary();
			};

			statusLogService.prototype.getLogs = function () {
				// return this.logs.slice(0);
				return _.clone(this.logs);
			};

			statusLogService.prototype.sumLogs = function () {
				var logTime = 0;
				angular.forEach(this.logs, function(log) {
					// console.log("calculating log time");
					// console.log(log);
					// console.log(logTime);
					// console.log(log.stop - log.start);
					if( log.stop ){
						logTime += log.stop - log.start;
					}
				});
				return logTime;
			};

			statusLogService.prototype.lastLog = function () {
				return this.logs.slice(-1)[0];
			};

			statusLogService.prototype.totalLogTime = function () {
				return this.sumLogs();
			};

			statusLogService.prototype.statusLogging = function () {
				var lastLog = this.lastLog();
				return (lastLog && !lastLog.stop)? true : false;
			};

			return new statusLogService(statusLog, args);
		};
		return statusLogFactory;
	}
]);