'use strict';

// App instance
var app = require('angular').module('app');

// App controllers
app.controller('Navbar_Ctrl', require('./navbar'));
app.controller('OPCUA_Server_Ctrl', require('./opcua_server'));