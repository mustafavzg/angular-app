angular.module('services.modelInitializer', []);

angular.module('services.modelInitializer').factory('modelInitializer', [
	'$parse',
	function ($parse) {
		var modelInitializer = {
			init: function (scope, model, initOptions, interpolationKeys, expressionKeys) {

				// setup interpolated (@) attributes
				for(var $index = -1; ++$index < interpolationKeys.length;){
					(function () {
						var attr = interpolationKeys[$index];
						model[attr] = initOptions[attr] || scope[attr];

						// wire up the directive attributes to the model
						var watchAttr = function (scope) {
							return scope[attr];
						};
						scope.$watch(watchAttr, function (newVal, oldVal) {
							if( newVal !== oldVal ){
								model[attr] = scope[attr];
							}
						});

						// wire up the initOptions attributes to the model
						var watchInitOption = function (scope) {
							return scope.initOptions[attr];
						};

						scope.$watch(watchInitOption, function (newVal, oldVal) {
							console.log("Is this happening");
							if( newVal !== oldVal ){
								console.log("are we getting in");
								console.log(attr);
								// model[attr] = "foo";
								model[attr] = scope.initOptions[attr];
							}
						});

					}());
				}

				// Setup expression (&) options
				for(var $indexb = -1; ++$indexb < expressionKeys.length;){
					(function () {
						var attr = expressionKeys[$indexb];
						if ( angular.isDefined(initOptions[attr]) ) {
							// var fn = initOptions[attr];
							var fnExp = initOptions[attr];
							var fn = $parse(fnExp);
							model[attr] = function (locals) {
								return fn(scope.$parent, locals);
							};
						}
						else if( angular.isDefined(scope[attr]) ){
							model[attr] = scope[attr];
						}
						else {
							model[attr] = function () {/*some dummy function*/};
						}
					}());
				}
			}
		};

		return modelInitializer;
	}
]);