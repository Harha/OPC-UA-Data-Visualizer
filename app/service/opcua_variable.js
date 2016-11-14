'use strict';

module.exports = function($resource, $q, config) {

	// Service instance
	var vm = this;

	// Service data
	vm.variables = [];

	// Service resources
	vm.OPCUA_Variable = $resource(
		config.rest_url + '/opcuavariables/:nsIdex',
		{nsIndex: '@id'},
		{
			'get': {method: 'GET', isArray: true}
		}
	);

	// REST: Fetch variables list
	vm.fetchVariables = function(nsIndex, identifier, serverId, datetimeFrom, datetimeTo) {
		var d = $q.defer();

		vm.OPCUA_Variable.get({
			nsIndex: (nsIndex) ? nsIndex : null,
			identifier: (identifier) ? identifier : null,
			serverId: (serverId) ? serverId : null,
			serverTimeStampFrom: (datetimeFrom) ? datetimeFrom.toISOString() : null,
			serverTimeStampTo: (datetimeTo) ? datetimeTo.toISOString() : null
		}, function(variables) {
			vm.variables = variables;
			d.resolve(vm.variables);
		});

		return d.promise;
	};

	// DATA: Get variable by parameters
	vm.getVariable = function(nsIndex, identifier, serverId) {
		if (vm.variables == null)
			return null;

		for (var i = 0; i < vm.variables.length; i++) {
			var variable = vm.variables[i];
			if (variable.nsIndex == nsIndex && variable.identifier == identifier && variable.serverId == serverId)
				return variable;
		}

		return null;
	};


};