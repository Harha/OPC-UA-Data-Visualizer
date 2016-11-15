'use strict';

// App instance
var app = require('angular').module('app');

// App controllers
app.service('OPCUA_Settings_Srvce', require('./opcua_settings'));
app.service('OPCUA_Server_Srvce', require('./opcua_server'));
app.service('OPCUA_Subscription_Srvce', require('./opcua_subscription'));
app.service('OPCUA_Variable_Srvce', require('./opcua_variable'));