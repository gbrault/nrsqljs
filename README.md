# nrsqljs
## Node Red sql.js "A node to manage Sqlite Databases with node-red"

### What is in here?
* A node-red node: nrsqljs
* A node-red flow (flows.json) providing the /sqljs webservice to query the SQLITE database, based on sql.js or sqlite3 backends
* An SQLITE data base manager or browser allowing to see, manipulate and create tables, it's based on JADE

### This work was possible thanks to
* [sql.js](https://github.com/kripken/sql.js/)  SQLite compiled to JavaScript through Emscripten
* [JADE](https://github.com/sunnygoyal/jade)  JAvascript based Database Editor
* [sqlite3](https://github.com/mapbox/node-sqlite3) Asynchronous, non-blocking SQLite3 bindings for Node.js

Many thanks to both github contributors Alon Zakai and Sunny Goyal and the company Mapbox (sqlite3) 

## Installation
1. make sure node-red is stopped!
2. go on your user node-red root directory (~/.node-red)

  ```
  npm install https://github.com/gbrault/nrsqljs
  ```
3. Copy Northwind.sqlite in your home directory (where you start node-red) (it's under &lt;nrsqljs&gt;/jade directory)
4. Start your node-red server (best from the command line to see console messages) from your home directory
5. Copy the flow (&lt;nrsqljs&gt;/flows.json) in a new flow from node-Red admin. Deploy it

You should be able to browse the Jade sqlite manager at http://127.0.0.1/jade

There is no documentation to use JADE, but for one who knows SQL (sqlite) and already pratice Adminer.php it should not be to much of a pain.
I have put some architecture notes [there](Architecture.md)

Don't forget to save your change clicking on the disk icon, upper left just under JADE!
