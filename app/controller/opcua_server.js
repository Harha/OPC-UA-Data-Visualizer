'use strict';

module.exports = function(
	$scope, $stateParams, $q, $log,
	OPCUA_Server_Srvce, OPCUA_Subscription_Srvce, OPCUA_Variable_Srvce
) {

	// Controller instance
	var vm = this;

	// Controller resources
	vm.server = OPCUA_Server_Srvce.OPCUA_Server;
	vm.subscription = OPCUA_Subscription_Srvce.OPCUA_Subscription;
	vm.variable = OPCUA_Variable_Srvce.OPCUA_Variable;

	// State variables
	vm.update = false;

	// Query filter object
	vm.filter = {
		subscriptions: [],
		dateFrom: {
			date: new Date()
		},
		dateTo: {
			date: new Date()
		}
	};

	// Filter, apply changes
	vm.applyFilter = function() {
		vm.initializeData();
		vm.cleanChart();
		vm.cleanSubscriptions();
	};

	// Filter, clear changes
	vm.clearFilter = function() {
		vm.filter.dateFrom.date = new Date();
		vm.filter.dateFrom.date.setMinutes(vm.filter.dateFrom.date.getMinutes() - 1.0);
		vm.filter.dateTo.date = new Date();
	};

	// Chart object
	vm.chart = {
		series: [],
		options: {
			scales: {
				yAxes: []
			}
		},
		datasetoverride: [],
		labels: [],
		data: [] // Array of datasets
	};

	// Chart, colors
	Chart.defaults.global.colors = ['#46BFBD', '#00ADF9', '#DCDCDC', '#803690', '#FDB45C', '#949FB1', '#4D5360'];

	// Chart, click
	vm.clickChart = function(points, evt) {
		$log.debug('opcua_server.ctrl - chart-click, points: ' + JSON.stringify(points) + ', event: ' + JSON.stringify(evt));
	};

	// Chart, clean
	vm.cleanChart = function() {
		vm.chart.series = [];
		vm.chart.options.scales.yAxes = [];
		vm.chart.datasetoverride = [];
		vm.chart.labels = [];
		vm.chart.data = [];
	};

	// Chart, update variables
	vm.updateChart = function() {
		vm.filter.dateFrom.date = vm.filter.dateTo.date;
		vm.filter.dateTo.date = new Date();

		vm.getVariables().then(function(results) {

			for (var i = 0; i < vm.filter.subscriptions.length; i++) {
				var variable = vm.getVariable(vm.filter.subscriptions[i].identifier);

				if (variable == null)
					continue;

				for (var j = 0; j < results.length; j++) {
					var var_new = results[j];

					if (var_new.serverId != variable.serverId || var_new.identifier != variable.identifier)
						continue;

					vm.chart.data[i].shift();
					if (var_new.value == 'true' || var_new.value == 'false') {
						vm.chart.data[i].push(var_new.value == 'true' ? 1 : 0);
					} else {
						vm.chart.data[i].push(parseFloat(var_new.value));
					}

					if (i <= 0) {
						vm.chart.labels.shift();
						var serverTimeStamp = new Date(var_new.serverTimeStamp).toISOString();
						var filterDateDiff = Math.abs(vm.filter.dateFrom.date.getTime() - vm.filter.dateTo.date.getTime());
						var filterDateDiffDays = Math.ceil(filterDateDiff / (1000 * 3600 * 24));
						if (filterDateDiffDays > 1.0) {
							vm.chart.labels.push(serverTimeStamp.slice(0, serverTimeStamp.length - 5).replace('T', ' '));
						} else {
							vm.chart.labels.push(serverTimeStamp.slice(11, serverTimeStamp.length - 1));
						}
					}
				}
			}

		});
	};

	// Chart, add a variable
	vm.addVariableToChart = function(variable) {

		// Add series
		vm.chart.series.push(variable.identifier);

		// Axis count
		var n_axes = vm.chart.options.scales.yAxes.length;

		// Add axis
		vm.chart.options.scales.yAxes.push({
			id: 'y-axis-' + n_axes,
			type: 'linear',
			display: true,
			position: 'left'
		});

		// Add dataset identifier
		vm.chart.datasetoverride.push({
			yAxisID: 'y-axis-' + n_axes
		});

		// Add new array to data
		vm.chart.data.push([]);

		// Add labels and data (x and y)
		for (var i = 0; i < vm.variables.length; i++) {
			var var_new = vm.variables[i];

			if (var_new.serverId != variable.serverId || var_new.identifier != variable.identifier)
				continue;
			
			if (n_axes <= 0) {
				var serverTimeStamp = new Date(var_new.serverTimeStamp).toISOString();
				var filterDateDiff = Math.abs(vm.filter.dateFrom.date.getTime() - vm.filter.dateTo.date.getTime());
				var filterDateDiffDays = Math.ceil(filterDateDiff / (1000 * 3600 * 24));
				if (filterDateDiffDays > 1.0) {
					vm.chart.labels.push(serverTimeStamp.slice(0, serverTimeStamp.length - 5).replace('T', ' '));
				} else {
					vm.chart.labels.push(serverTimeStamp.slice(11, serverTimeStamp.length - 1));
				}
			}

			if (var_new.value == 'true' || var_new.value == 'false') {
				vm.chart.data[n_axes].push(var_new.value == 'true' ? 1 : 0);
			} else {
				vm.chart.data[n_axes].push(parseFloat(var_new.value));
			}
		}

	};

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

		return null;
	};

	// Monitoring, add subscription
	vm.selectSubscription = function(identifier) {
		var subscription = vm.getSubscription(identifier);
		vm.filter.subscriptions.push(subscription);
		vm.addVariableToChart(subscription);
	};

	// Monitoring, clear subscriptions
	vm.cleanSubscriptions = function() {
		vm.filter.subscriptions = [];
	};

	// Fetch server variables
	vm.getVariables = function() {
		var d = $q.defer();

		vm.variable.get({
			serverId: ($stateParams.serverId) ? $stateParams.serverId : null,
			serverTimeStampFrom: vm.filter.dateFrom.date.toISOString(),
			serverTimeStampTo: vm.filter.dateTo.date.toISOString()
		}, function(variables) {
			vm.variables = variables;
			d.resolve(vm.variables);
		});

		return d.promise;
	};

	// Get variable by identifier
	vm.getVariable = function(identifier) {
		if (vm.variables == null)
			return null;

		var serverId = $stateParams.serverId;
		for (var i = 0; i < vm.variables.length; i++) {
			var variable = vm.variables[i];
			if (variable.serverId == serverId && variable.identifier == identifier)
				return variable;
		}

		return null;
	};

	// Initialize filter
	vm.clearFilter();

	// Initialize data
	vm.initializeData = function() {
		vm.getServers();
		vm.getSubscriptions();
		vm.getVariables();
	};

	// Initially load data using default filter
	vm.initializeData();

};