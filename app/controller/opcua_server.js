'use strict';

module.exports = function(
	$scope, $stateParams, $q, $log,
	OPCUA_Server_Srvce, OPCUA_Subscription_Srvce, OPCUA_Variable_Srvce
) {

	// Controller instance
	var vm = this;

	// Filter variables, subscriptions
	vm.filterSub = {
		selected: null
	};

	vm.selectSubscription = function(identifier) {
		$log.debug('opcua_server.ctrl - Filter, selected subscription: ' + identifier);
		vm.filterSub.selected = vm.getSubscription(identifier);
		vm.initializeData();
	};

	// Filter variables, datetime
	vm.dateFrom = {
		date: new Date(),
		options: {
			minDate: new Date('2016-01-01'),
			showWeeks: true
		},
		opened: false
	};

	vm.dateFrom.date.setDate(vm.dateFrom.date.getDate() - 2);

	vm.dateFromOpen = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		vm.dateFrom.opened = true;
		vm.initializeData();
	};

	// Chart variables
	vm.chart = {
		series: [
			'Series A'
		],
		options: {
			scales: {
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left'
					}
				]
			}
		},
		datasetoverride: [
			{
				yAxisID: 'y-axis-1'
			}
		],
		labels: ["January", "February", "March", "April", "May", "June", "July"],
		data: [65, 59, 80, 81, 56, 55, 40]
	};

	vm.chartClick = function(points, evt) {
		$log.debug('opcua_server.ctrl - chart-click, points: ' + points + ', event: ' + evt);
	};

	// Controller resources
	vm.server = OPCUA_Server_Srvce.OPCUA_Server;
	vm.subscription = OPCUA_Subscription_Srvce.OPCUA_Subscription;
	vm.variable = OPCUA_Variable_Srvce.OPCUA_Variable;

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

	// Get current server
	vm.getServer = function() {
		if (vm.servers == null)
			return null;

		var serverId = $stateParams.serverId;
		for (var i = 0; i < vm.servers.length; i++) {
			var server = vm.servers[i];
			if (server.serverId == serverId)
				return server;
		}
	};

	// Fetch subscriptions from REST
	vm.getSubscriptions = function() {
		var d = $q.defer();

		vm.subscription.get({
			serverId: ($stateParams.serverId) ? $stateParams.serverId : null
		}, function(subscriptions) {
			vm.subscriptions = subscriptions;
			d.resolve(vm.subscriptions);
		});

		return d.promise;
	};

	// Get subscription by identifier
	vm.getSubscription = function(identifier) {
		if (vm.subscriptions == null)
			return null;

		var serverId = $stateParams.serverId;
		for (var i = 0; i < vm.subscriptions.length; i++) {
			var subscription = vm.subscriptions[i];
			if (subscription.serverId == serverId && subscription.identifier == identifier)
				return subscription;
		}
	};

	// Fetch server variables
	vm.getVariables = function() {
		var d = $q.defer();

		vm.variable.get({
			serverId: ($stateParams.serverId) ? $stateParams.serverId : null,
			serverTimeStamp: vm.dateFrom.date.toISOString()
		}, function(variables) {
			vm.variables = variables;
			d.resolve(vm.variables);
		});

		return d.promise;
	};

	// Initialize data
	vm.initializeData = function() {
		vm.getServers().then(function(servers) {
			vm.getSubscriptions().then(function(subscriptions) {
				vm.getVariables().then(function(variables) {
					$log.debug('opcua_server.ctrl - Fetched all data from REST.\n' +
								'servers:' + servers.length 				+ '\n' +
								'subscriptions: ' + subscriptions.length	+ '\n' +
								'variables: ' + variables.length);

					if (vm.filterSub.selected == null)
						return;

					$log.debug('opcua_server.ctrl - Destroying existing chart...');

					vm.chart.labels = [];
					vm.chart.data = [];
					vm.chart.series = vm.filterSub.selected.identifier;

					$log.debug('opcua_server.ctrl - Converting variable data to for the chart...');

					var f = 0.0;
					for (var i = 0; i < vm.variables.length; i++) {
						var variable = vm.variables[i];
						if (variable.serverId != vm.filterSub.selected.serverId || variable.identifier != vm.filterSub.selected.identifier)
							continue;

						vm.chart.labels.push(f);

						if (variable.value == 'true' || variable.value == 'false') {
							vm.chart.data.push(variable.value == 'true' ? 1 : 0);
						} else {
							vm.chart.data.push(parseFloat(variable.value));
						}
						f += 0.1;
					}

					$log.debug('opcua_server.ctrl - Variable data conversion for chart completed.');
				});
			});
		});
	};
	vm.initializeData();

};