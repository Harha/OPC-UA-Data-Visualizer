'use strict';

module.exports = function($resource, config) {

	// Service instance
	var vm = this;

	// Service resources
	vm.OPCUA_Variable = $resource(
		config.rest_url + '/opcuavariables/:nsIdex',
		{nsIndex: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

};