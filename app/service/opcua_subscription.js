'use strict';

module.exports = function($resource, $q, config) {

	// Service instance
	var vm = this;

	// Service data
	vm.subscriptions = [];

	// Service resources
	vm.OPCUA_Subscription = $resource(
		config.rest_url + '/opcuasubscriptions/:nsIdex',
		{nsIndex: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

	// REST: Fetch subscriptions list
	vm.fetchSubscriptions = function(nsIndex, identifier, serverId) {
		var d = $q.defer();

		vm.OPCUA_Subscription.get({
			nsIndex: (nsIndex) ? nsIndex : null,
			identifier: (identifier) ? identifier : null,
			serverId: (serverId) ? serverId : null
		}, function(subscriptions) {
			vm.subscriptions = subscriptions;
			d.resolve(vm.subscriptions);
		});

		return d.promise;
	};

	// DATA: Get subscription by parameters
	vm.getSubscription = function(nsIndex, identifier, serverId) {
		if (vm.subscriptions == null)
			return null;

		for (var i = 0; i < vm.subscriptions.length; i++) {
			var subscription = vm.subscriptions[i];
			if (subscription.nsIndex == nsIndex && subscription.identifier == identifier && subscription.serverId == serverId)
				return subscription;
		}

		return null;
	};

};