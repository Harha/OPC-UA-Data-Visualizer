'use strict';

module.exports = function($scope, $q, OPCUA_Server_Srvce) {

	// Controller instance
	var vm = this;

	// Controller resources
	vm.server = OPCUA_Server_Srvce.OPCUA_Server;

	// Fetch servers from REST
	vm.getServers = function() {
		var d = $q.defer();

		vm.server.get({
		}, function(servers) {
			vm.servers = servers;
			d.resolve(vm.servers);
		});

		return d.promise;
	};

	// Initialize data
	vm.getServers();

};