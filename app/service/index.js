'use strict';

// App instance
var app = require('angular').module('app');

// App controllers
app.service('OPCUA_Server_Srvce', require('./opcua_server'));