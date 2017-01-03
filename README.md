OPC UA Data Visualizer
======================

Example tool for visualizing OPC UA data served either by a REST service or a socket.io server.

Related projects
----------------
1. Gateway project: [OPC UA Data Gateway](https://github.com/Harha/OPC-UA-Data-Gateway)
2. REST project: [OPC UA Data REST](https://github.com/Harha/OPC-UA-Data-REST)
3. Socket.io project: [OPC UA Data Server](https://github.com/Harha/OPC-UA-Data-Server)
4. Client project: [OPC UA Data Visualizer](https://github.com/Harha/OPC-UA-Data-Visualizer)

Build tools (install globally, 'npm install package -g')
-----------
- npm
- rimraf
- cpx

Build tasks
-----------
- clean			(cleans ./dist folder)
- build:js
- build:html
- build:css
- build:fonts
- uglify:js
- build:dev		(development build)
- build:prod	(production build, uglified)
- serve			(development server, localhost:8080/dist/)