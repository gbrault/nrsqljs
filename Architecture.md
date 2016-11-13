# Architecture
* sql.js is used as is and the last 0.3.* version is installed (if not present): see package.json, the dependency statement
* JADE is transformed, as the origine of JADE is to be a web-based local Database Editor

# JADE modifications
In the version 0.1.0 of nrsqljs, the following JADE files have been tweaked
* app.js: to avoid executing openDB and importSql functions
* change the name of &#95;locales to &#95;locales&#95; as it was filtered by express???
* message.json: in fr, en and en-US added two commands and translation
* sql.worker.js: load sqlr.js instead of sql.js
* in third_party/sql added the sqlr.js file which do the webservice work

# How data is exchanged?
sqlr.js implements the SQL interface as sql.js does. It implements the Database class with a subset of functions used by JADE.
There is no need to open the Database, as this is done by the node at the servere side. Database class just provide access to functions under the webservice control implemented by the flow and the sqljs node on the server side.
* export: write the database selected in the node back to disk (sql.js "holds" the Database in Memory)
* prepare: send the prepare type request and return a stm proxy with the following function. maintain an handle for subsequent stm requests
 * run: send the stm run query and retorn the parsed response
 * step: send the stm step query (no argument) return true if not finished and false at the end
 * get: send the stm get request with data if so, return the paresed json result
 * free: will free the stm structure labelled with the handle tag
 
 With this interface it seems all the needs of JADE seems covered
 
# Next Steps
 
 ## Database backend
 sql.js has a nice feature: to be javascript based, but it has also a big drawback: it reads the database in memory.
 I will invetigate other sqlite backend for nodes to see if it can work from the file system, like sqlite3.exe does.
 Like that, it will be possible to handle bigger databases.
 
 ## JADE improvments
 JADE is already very nice and handy, but many HMI aspect can be improved. It is already very good to strat sketching sql data  driven projects... 



