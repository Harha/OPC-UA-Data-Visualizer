OPC UA Data Visualizer
=================

Tool for visualizing OPC UA data.

Related projects
----------------
Backend project: [OPC UA Data REST](https://github.com/Harha/OPC-UA-Data-REST)

Gateway project: [OPC UA Data Gateway](https://github.com/Harha/OPC-UA-Data-Gateway)

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