// jQuery & Bootstrap
$ = jQuery = require('jquery');
var bootstrap = require('bootstrap');

// Angular instance
var angular = require('angular');

// App instance
var app = angular.module('app', [
	// Angular includes
	require('angular-resource'),
	require('angular-animate'),
	// 3rd party includes
	require('angular-ui-router'),
	require('angular-ui-bootstrap'),
	require('angular-loading-bar'),
	require('angular-chart.js')
]);

// App includes
require('./controller');
require('./service');

// App resource provider
app.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}]);

// App configuration
app.constant('config', {
	rest_url: 'http://localhost:9090'
});

// App routes
app.config(function($stateProvider, $urlRouterProvider) {

	//$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('main', {
			url: '/',
			templateUrl: 'view/main.html'
		})
		.state('opcua_servers', {
			url: '/opcua_servers/:serverId',
			templateUrl: 'view/opcua_servers.html'
		});
});