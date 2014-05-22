angular.module('services.modelInitializer', []);

angular.module('services.modelInitializer').factory('modelInitializer', [
	function () {
		var modelInitializer = {
			init:function (scope, model, initOptions, interpolationKeys, expressionKeys) {

				// var interpolationKeys = [
				// 	'rootDivClass',
				// 	'collectionName',
				// 	'label',
				// 	'helptip',
				// 	'actionName',
				// 	'actionIcon',
				// 	'actionButtonClass',
				// 	'actionHidden',
				// 	'actionDisabled'
				// ];

				// setup interpolated (@) options
				for(var $index = -1; ++$index < interpolationKeys.length;){
					var option = interpolationKeys[$index];
					model[option] = initOptions[option] || scope[option];
				}

				// Setup expression (&) options
				// var expressionKeys = [
				// 	'action',
				// 	'roleFunction'
				// ];

				for(var $indexb = -1; ++$indexb < expressionKeys.length;){
					var option = expressionKeys[$indexb];

					if ( angular.isDefined(initOptions[option]) ) {
						model[option] = function (index) {
							var option = expressionKeys[$indexb];
							var fn = initOptions[option];
							return function (locals) {
								return fn(locals.user);
							};
						}($indexb);
					}
					else if( angular.isDefined(scope[option]) ){
						model[option] = scope[option];
					}
					else {
						model[option] = function () {/*some dummy function*/};
					}
				}
			}
		};

		return modelInitializer;
	}
]);