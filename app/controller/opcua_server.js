'use strict';

module.exports = function(
	$scope, $stateParams, $q, $log,
	OPCUA_Server_Srvce, OPCUA_Subscription_Srvce, OPCUA_Variable_Srvce
) {

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

	// DATA, get variables
	vm.getVariables = function() {
		return OPCUA_Variable_Srvce.variables;
	};

	// ------------------------------------------------------------------------
	// -- Filter section
	// ------------------------------------------------------------------------

	// Filter, js object
	vm.filter = {
		dateFrom: {
			date: new Date()
		},
		dateTo: {
			date: new Date()
		}
	};

	// ------------------------------------------------------------------------
	// -- Chart section
	// ------------------------------------------------------------------------

	// Chart, configuration
	Chart.defaults.global.colors = ['#46BFBD', '#00ADF9', '#DCDCDC', '#803690', '#FDB45C', '#949FB1', '#4D5360'];

	// Chart, js object
	vm.chart = {
		series: [],
		options: {
			scales: {
				yAxes: []
			}
		},
		datasetoverride: [],
		labels: [],
		data: []
	};

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

	// Chart, update
	/*vm.updateChart = function() {
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
	};*/

	// Chart, add a variable
	/*vm.addVariableToChart = function(variable) {

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

	};*/

	// ------------------------------------------------------------------------
	// -- Init section
	// ------------------------------------------------------------------------

	// REST, download data
	OPCUA_Server_Srvce.fetchServers();
	OPCUA_Subscription_Srvce.fetchSubscriptions(null, null, $stateParams.serverId);

};