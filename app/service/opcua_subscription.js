'use strict';

module.exports = function($resource, config) {

	// Service instance
	var vm = this;

	// Service resources
	vm.OPCUA_Subscription = $resource(
		config.rest_url + '/opcuasubscriptions/:nsIdex',
		{nsIndex: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

};