'use strict';

module.exports = function($resource, $q, config) {

	// Service instance
	var vm = this;

	// Service data
	vm.servers = [];

	// Service resources
	vm.OPCUA_Server = $resource(
		config.rest_url + '/opcuaservers/:serverId',
		{serverId: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

	// REST: Fetch servers list
	vm.fetchServers = function() {
		var d = $q.defer();

		vm.OPCUA_Server.get({
		}, function(servers) {
			vm.servers = servers;
			d.resolve(vm.servers);
		});

		return d.promise;
	};

	// DATA: Get server by serverId
	vm.getServer = function(serverId) {
		if (vm.servers == null)
			return null;

		for (var i = 0; i < vm.servers.length; i++) {
			var server = vm.servers[i];
			if (server.serverId == serverId)
				return server;
		}
	};

};