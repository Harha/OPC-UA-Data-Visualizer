// Non-angular includes
var jquery = require('jquery');
var bootstrap = require('bootstrap');
var socketio = require('socket.io-client');

// Angular instance
var angular = require('angular');

// App instance
var app = angular.module('app', [
	// Angular includes
	require('angular-resource'),
	require('angular-animate'),
	require('angular-touch'),
	// 3rd party includes
	require('angular-ui-router'),
	require('angular-ui-bootstrap'),
	require('angular-chart.js')
]);

// App includes
require('./controller');
require('./service');
require('./directive');

// App resource provider
app.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}]);

// App configuration
app.constant('config', {
	rest_url: 'http://localhost:9090',
	serv_url: 'http://localhost:9091'
});

// App routes
app.config(function($stateProvider, $urlRouterProvider) {

	//$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('main', {
			url: '/',
			templateUrl: 'view/main.html'
		})
		.state('opcua_settings', {
			url: '/opcua_settings',
			templateUrl: 'view/opcua_settings.html'
		})
		.state('opcua_server', {
			url: '/opcua_server/:serverId',
			templateUrl: 'view/opcua_server.html'
		});
});