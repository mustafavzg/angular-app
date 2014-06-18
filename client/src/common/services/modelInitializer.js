angular.module('services.directiveInitializerOld', []);

angular.module('services.directiveInitializerOld').factory('directiveInitializerOld', [
	'$parse',
	function ($parse) {
		var directiveInitializer = {
			// init: function (scope, attrs, model, initOptions, interpolationKeys, expressionKeys, attrDefaults, setupWatches) {
			init: function (scope, model, attrsData, setupWatches) {

				var attrs = attrsData.attrs || {};
				var initOptions =  attrsData.initOptions || {};
				var interpolationKeys =  attrsData.interpolationKeys || [];
				var expressionKeys =  attrsData.expressionKeys || [];
				var attrDefaults =  attrsData.attrDefaults || {};
				setupWatches =  setupWatches || false;

				// setup interpolated (@) attributes
				for(var $index = -1; ++$index < interpolationKeys.length;){
					(function () {
						var attr = interpolationKeys[$index];
						// model[attr] = initOptions[attr] || scope[attr] || attrDefaults[attr];
						model[attr] = scope[attr] || initOptions[attr] || attrDefaults[attr];

						if( angular.isDefined(scope[attr]) && setupWatches){
							// wire up the directive attributes to the model
							var watchAttr = function (scope) {
								return scope[attr];
							};
							scope.$watch(watchAttr, function (newVal, oldVal) {
								if( newVal !== oldVal ){
									model[attr] = scope[attr];
								}
							});
						}

						// if( setupWatches){
						if( angular.isDefined(scope.initOptions)
						 && angular.isDefined(scope.initOptions[attr]) && setupWatches){
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
						}

					}());
				}

				// Setup expression (&) options
				for(var $indexb = -1; ++$indexb < expressionKeys.length;){
					(function () {
						var attr = expressionKeys[$indexb];
						if( angular.isDefined(attrs[attr]) ){
							model[attr] = scope[attr];
						}
						else if ( angular.isDefined(initOptions[attr]) ) {
							var fnExp = initOptions[attr];
							var fn = $parse(fnExp);
							model[attr] = function (locals) {
								return fn(scope.$parent, locals);
							};
						}
						else if( angular.isDefined(attrDefaults[attr]) ){
							// model[attr] = attrDefaults[attr] || function () {/*some dummy function*/};
							console.log("setting up the default action: " + attr);
							var fnExp = attrDefaults[attr];
							var fn = $parse(fnExp);
							model[attr] = function (locals) {
								return fn(scope.$parent, locals);
							};
						}
						else {
							model[attr] = function () {/*some dummy function*/
								console.log("dummy function");
							};
						}

					}());
				}
			}
		};

		return directiveInitializer;
	}
]);