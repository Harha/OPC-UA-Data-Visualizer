'use strict';

module.exports = function($resource, config) {

	// Service instance
	var vm = this;

	// Service resources
	vm.OPCUA_Server = $resource(
		config.rest_url + '/opcuaservers/:serverId',
		{serverId: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

};