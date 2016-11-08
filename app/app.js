// Angular instance
var angular = require('angular');

// App instance
var app = angular.module('app', [
	// Angular includes
	require('angular-resource'),
	// 3rd party includes
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