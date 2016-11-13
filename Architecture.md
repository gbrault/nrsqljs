# Architecture
* sql.js is used as is and the last version is installed: see package.json, the dependency statement
* JADE is transformed, as the origine of JADE is to be a web-based local Database Editor
# JADE modification
In the version 0.1.0 of nrsqljs, the following JADE files have been tweaked
* app.js: to avoid executing openDB and importSql functions
* change the name of _ _locales to _locales_ _ as it was filtered by express???_
* message.json: in fr, en and en-US added two commands and translation


