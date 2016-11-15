'use strict';

module.exports = function(
	$scope,
	$q,
	$log,
	OPCUA_Settings_Srvce
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

};