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

	// Query filter object
	vm.filter = {
		subscriptions: [],
		dateFrom: {
			date: new Date(),
			options: {
				minDate: new Date('2016-01-01'),
				showWeeks: true
			},
			opened: false
		}
	};

	// Filter, apply changes
	vm.applyFilter = function() {
		vm.initializeData();
		vm.cleanChart();
	};

	// Filter, add subscription
	vm.selectSubscription = function(identifier) {
		var subscription = vm.getSubscription(identifier);
		vm.filter.subscriptions.push(subscription);
		vm.addVariableToChart(subscription);
	};

	// Filter, clean subscriptions
	vm.cleanSubscriptions = function() {
		vm.filter.subscriptions = [];
	};

	// Filter, open dateFrom
	vm.openDateFrom = function() {
		vm.filter.dateFrom.opened = true;
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

	// Add a variable to the chart
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
			
			if (n_axes <= 0)
				vm.chart.labels.push(new Date(var_new.serverTimeStamp).toISOString());

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
	};

	// Fetch server variables
	vm.getVariables = function() {
		var d = $q.defer();

		vm.variable.get({
			serverId: ($stateParams.serverId) ? $stateParams.serverId : null,
			serverTimeStamp: vm.filter.dateFrom.date.toISOString()
		}, function(variables) {
			vm.variables = variables;
			d.resolve(vm.variables);
		});

		return d.promise;
	};

	// Initialize filter
	vm.filter.dateFrom.date.setMinutes(vm.filter.dateFrom.date.getMinutes() - 1.0);

	// Initialize data
	vm.initializeData = function() {
		vm.getServers();
		vm.getSubscriptions();
		vm.getVariables();
	};

	// Initially load data using default filter
	vm.initializeData();

};