'use strict';

module.exports = function($resource, $q, config) {

	// Service instance
	var vm = this;

	// Service data
	vm.initialized = false;

	// Initialize socket connection
	vm.socket = io.connect(config.serv_url);

};