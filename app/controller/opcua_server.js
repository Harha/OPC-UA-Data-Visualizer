'use strict';

module.exports = function(
	$scope,
	$stateParams,
	$q,
	$interval,
	$log,
	config,
	OPCUA_Settings_Srvce,
	OPCUA_Server_Srvce,
	OPCUA_Subscription_Srvce,
	OPCUA_Variable_Srvce,
	OPCUA_Socket_Srvce
) {

	// Controller instance
	var vm = this;

	// ------------------------------------------------------------------------
	// -- Data section
	// ------------------------------------------------------------------------

	// DATA, get settings
	vm.getSettings = function() {
		return OPCUA_Settings_Srvce.settings;
	};

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
			date: new Date(),
			format: 'dd.MM.yyyy HH:mm:ss',
			options: {
				formatYear: 'yy',
				maxDate: new Date(2100, 1, 1),
				minDate: new Date(2000, 1, 1),
				startingDay: 1
			},
			opened: false
		},
		dateTo: {
			date: new Date(),
			format: 'dd.MM.yyyy HH:mm:ss',
			options: {
				formatYear: 'yy',
				maxDate: new Date(2100, 1, 1),
				minDate: new Date(2000, 1, 1),
				startingDay: 1
			},
			opened: false
		}
	};

	// Filter, dateFrom open
	vm.openDateFromFilter = function() {
		vm.filter.dateFrom.opened = true;
	};

	// Filter, dateTo open
	vm.openDateToFilter = function() {
		vm.filter.dateTo.opened = true;
	};

	// Filter, reset
	vm.resetFilter = function() {
		vm.filter.dateFrom.date = new Date();
		vm.filter.dateFrom.date.setMinutes(vm.filter.dateFrom.date.getMinutes() - 1);
		vm.filter.dateTo.date = new Date();
	};

	// ------------------------------------------------------------------------
	// -- socket.io section
	// ------------------------------------------------------------------------

	// socket.io, js object
	vm.socketio = {
		subscriptions: [],
		data: [],
		updaterate: 100
	};

	// socket.io, if enabled
	if (vm.getSettings().socketio === true && OPCUA_Socket_Srvce.initialized === false) {
		// get socket instance
		var socket = OPCUA_Socket_Srvce.socket;

		// socket, receive opcuavariable
		socket.on('opcuavariable', function(data) {
			$log.debug('input | opcuavariable, identifier: ' + data.identifier + ", nsIndex: " + data.nsIndex);

			vm.socketio.data.push(data);

			if (vm.socketio.data.length >= vm.socketio.subscriptions.length) {
				vm.addValueChart(vm.socketio.data);
				vm.socketio.data = [];
			}
		});

		// socket, fetch variables
		$interval(function() {
			for (var i = 0; i < vm.socketio.subscriptions.length; i++) {
				socket.emit('opcuavariable', vm.socketio.subscriptions[i]);
			}
		}, vm.socketio.updaterate);

		// socket, set initialized to true
		OPCUA_Socket_Srvce.initialized = true;
	}

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

	// Chart, clear
	vm.clearChart = function() {
		vm.chart.series = [];
		vm.chart.options.scales.yAxes = [];
		vm.chart.datasetoverride = [];
		vm.chart.labels = [];
		vm.chart.data = [];
	};

	// Chart, add value
	vm.addValueChart = function(data) {
		// Hold info of did we add a new value ?
		var added_new = false;

		// Loop over all variables
		for (var i = 0; i < data.length; i++) {
			// Get current variable
			var variable = data[i];

			// Is this a new or existing variable?
			var add_new = false;
			if (vm.chart.series.indexOf(variable.identifier) === -1)
				add_new = true;

			// Axis number for the variable
			var n_axis = vm.chart.options.scales.yAxes.length - 1;
			if (add_new === true) {
				for (var j = 0; j < vm.socketio.subscriptions.length; j++) {
					var sub = vm.socketio.subscriptions[j];

					if (sub.identifier == variable.identifier && sub.nsIndex == variable.nsIndex) {
						n_axis = j;
						break;
					}
				}
			}

			// Check if we need to update the variable, return if not
			if (add_new === false) {
				if (vm.socketio.subscriptions[n_axis].lastUpdate != null) {
					if (vm.socketio.subscriptions[n_axis].lastUpdate == variable.serverTimeStamp) {
						return;
					}
				}
			}

			// Add new series if it doesn't exist
			if (add_new === true)
				vm.chart.series.push(variable.identifier);

			// Add axis if it doesn't exist
			if (add_new === true) {
				vm.chart.options.scales.yAxes.push({
					id: 'y-axis-' + n_axis,
					type: 'linear',
					display: true,
					position: 'left'
				});
			}

			// Add dataset identifier if it doesn't exist
			if (add_new === true) {
				vm.chart.datasetoverride.push({
					yAxisID: 'y-axis-' + n_axis
				});
			}

			// Add new array to data
			if (add_new === true)
				vm.chart.data.push([]);

			// Add data (y)
			if (variable.value == 'true' || variable.value == 'false') {
				vm.chart.data[n_axis].push(variable.value == 'true' ? 1 : 0);
			} else {
				vm.chart.data[n_axis].push(parseFloat(variable.value));
			}

			// Remove data from end if over size limit
			if (vm.chart.data[n_axis].length > config.chart_max_values)
				vm.chart.data[n_axis].shift();

			// Add last timestamp to subscription & set added_new
			vm.socketio.subscriptions[n_axis].lastUpdate = variable.serverTimeStamp;
			added_new = true;
		}

		// Add label if we added new data
		if (added_new === true && add_label) {
			var timeStamp = new Date().toISOString();
			vm.chart.labels.push(timeStamp.slice(0, timeStamp.length - 5).replace('T', ' '));

			// Remove label from end if over size limit
			if (vm.chart.labels.length > config.chart_max_values)
				vm.chart.labels.shift();
		}
	};

	// Chart, add variable
	vm.addVarChart = function(subscription) {

		// REST
		if (vm.getSettings().socketio === false) {
			// Fetch variables
			OPCUA_Variable_Srvce.fetchVariables(
				subscription.nsIndex,
				subscription.identifier,
				subscription.serverId,
				vm.filter.dateFrom.date,
				vm.filter.dateTo.date
			).then(function(results) {

				// Add series
				vm.chart.series.push(subscription.identifier);

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

				// Add labels (x) and data (y)
				for (var i = 0; i < results.length; i++) {
					var var_new = results[i];
					
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

			});
		}
		// socket.io
		else {
			vm.socketio.subscriptions.push(subscription);
		}

	};

	// ------------------------------------------------------------------------
	// -- Init section
	// ------------------------------------------------------------------------

	// REST, download data
	OPCUA_Server_Srvce.fetchServers();
	OPCUA_Subscription_Srvce.fetchSubscriptions(null, null, $stateParams.serverId);

	// Filter, reset parameters
	vm.resetFilter();

	// Chart, clear parameters
	vm.clearChart();

};