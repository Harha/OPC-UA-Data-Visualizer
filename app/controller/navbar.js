'use strict';

module.exports = function($scope, $q, OPCUA_Server_Srvce, OPCUA_Subscription_Srvce) {

	// Controller instance
	var vm = this;

	// ------------------------------------------------------------------------
	// -- Data section
	// ------------------------------------------------------------------------

	// DATA, get servers
	vm.getServers = function() {
		return OPCUA_Server_Srvce.servers;
	};

	// DATA, get subscriptions
	vm.getSubscriptions = function() {
		return OPCUA_Subscription_Srvce.subscriptions;
	};

	// ------------------------------------------------------------------------
	// -- Init section
	// ------------------------------------------------------------------------

	// REST, download data
	OPCUA_Server_Srvce.fetchServers();
	OPCUA_Subscription_Srvce.fetchSubscriptions(null, null, null);

};