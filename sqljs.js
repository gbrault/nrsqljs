
module.exports = function (RED) {
    "use strict";
    var reconnect = RED.settings.sqliteReconnectTime || 20000;
    var SQL = require('sql.js');
    var SQL3 = require('sqlite3').verbose();
    var fs = require('fs');
    var path = require('path');
    var express = require('express');

    var log = function (node) {
        var i;

        if ((node !== undefined) && (node !== null) && (node.loging !== undefined) && (node.loging === false)) return;

        var keys = Object.keys(arguments);
        var show = "";
        for (i = 1; i < keys.length; i++) {
            if (arguments[keys[i]].length > 100)
                show = show.concat(arguments[keys[i]].substr(0, 200) + "...");
            else
                show = show.concat(arguments[keys[i]]);
        }
        var ts = new Date();
        var n = ts.toString();
        n = n.substr(n.indexOf(" ") + 1);
        n = n.substr(0, n.indexOf("("));
        console.log(n + " " + show);
    };

    log(null, "./ = %s", path.resolve("./"));
    var dir = path.resolve(__dirname, 'jade');
    log(null, dir);
    var app = RED.httpNode;
    app.use('/jade', express.static(dir));

    log(null, "Def: SqljsNodeDB");

    function SqljsNodeDB(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        log(node, "Node created: SqljsNodeDB");

        this.dbname = n.db;
        this.backend = n.backend;

        node.doConnect = function () {
            var filebuffer = null;
            log(node, "backend switch = ", this.backend);
            try {
                if (this.backend === true) {
                    log(node, "connect to:", node.dbname, " backend sql.js");                    
                    filebuffer = fs.readFileSync(node.dbname);
                    node.db = new SQL.Database(filebuffer);
                } else {
                    log(node, "./ = %s", path.resolve("./"));
                    log(node, "connect to:", node.dbname, " backend sqlite3.js");                    
                    node.db = new SQL3.Database(node.dbname);
                }
                if (node.tick) { clearTimeout(node.tick); }
                log(node, "opened " + node.dbname + " ok");
            }
            catch (err) {
                node.error("failed to open " + node.dbname, err);
                node.tick = setTimeout(function () { node.doConnect(); }, reconnect);
            }
        }

        node.on('close', function () {
            if (node.tick) { clearTimeout(node.tick); }
            if (node.db) { node.db.close(); }
        });
    }
    RED.nodes.registerType("sqljsdb", SqljsNodeDB);

    log(null, "Def: SqljsNodeIn");

    function SqljsNodeIn(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        this.loging = n.loging;
        this.mydb = n.mydb;
        this.mydbConfig = RED.nodes.getNode(this.mydb);
        if (node.mydbConfig.backend) {
            node.status({fill:"green",shape:"dot",text:"backend sql.js"});
        } else {
            node.status({fill:"green",shape:"dot",text:"backend sqlite3.js"});
        }        

        /* transform an array of objects into two arrays
        */
        this.factorize = function (rows) {
            if (rows !== undefined && rows !== null && rows.length > 0) {
                var colnames = Object.keys(rows[0]);
                var arows = [];
                for (var i = 0; i < rows.length; i++) {
                    var trow = [];
                    for (var j = 0; j < colnames.length; j++) {
                        trow.push(rows[i][colnames[j]]);
                    }
                    arows.push(trow);
                }
                return [{ "columns": colnames, "values": arows }];
            } else {
                return [{ "columns": [], "values": [] }];
            }
        };

        /* transform a row into an array
        */
        this.transcode =function(row){
            var keys = Object.keys(row);
            var tmp =[];
            for(var key in keys){
                tmp.push(row[key]);
            }
            return tmp;
        };

        if (this.mydbConfig) {
            this.mydbConfig.doConnect();
            node.on("input", function (msg) {
                this.msg = msg;
                if ((typeof msg.topic === 'string') && (typeof msg.type === 'string')) {
                    if (msg.type === "export") {
                        if (node.mydbConfig.backend) {
                            log(node, "export");
                            var data = node.mydbConfig.db.export();
                            var buffer = new Buffer(data);
                            fs.writeFileSync(node.mydbConfig.dbname, buffer);
                        } // else no need has it's updated on-line
                    } else
                        if (msg.type === "exec") {
                            try {
                                log(node, "exec:", msg.topic);
                                if (node.mydbConfig.backend) {
                                    var res = node.mydbConfig.db.exec(msg.topic);
                                    msg.payload = res;
                                    log(node, JSON.stringify(msg.payload));
                                    node.send(msg);
                                } else {
                                    node.mydbConfig.db.all(msg.topic, function (err, rows) {
                                        if (err) {
                                            node.error(err, msg);
                                        } else {
                                            msg.payload = this.factorize(rows);
                                            log(node, JSON.stringify(msg.payload));
                                            this.send(msg);
                                        }
                                    }.bind(node));
                                }
                            } catch (err) {
                                node.error(err, msg);
                            }
                        } else
                            if (msg.type === "prepare") {
                                try {
                                    var stm = {};
                                    if (node.stm === undefined) {
                                        node.stm = {};
                                    }
                                    log(node, "prepare:", msg.topic);
                                    if (node.mydbConfig.backend) {
                                        stm = node.mydbConfig.db.prepare(msg.topic);
                                    } else {
                                        node.mydbConfig.db.serialize(function () {
                                            stm = node.mydbConfig.db.prepare(msg.topic);
                                        }.bind(node));
                                    }
                                    var index = Math.floor((Math.random() * 10000) + 1); // Object.keys(node.stm).length;
                                    log(node, "prepare: hd=", 'p_' + index),
                                        node.stm['p_' + index] = stm;
                                    msg.payload = { hd: 'p_' + index };
                                    log(node, JSON.stringify(msg.payload));
                                    node.send(msg);
                                } catch (err) {
                                    node.error(err, msg);
                                }
                            } else
                                if (msg.type === "run") {
                                    try {
                                        if ((node.stm !== undefined) && (node.stm[msg.hd] !== undefined)) {
                                            log(node, "hd", msg.hd, " run:", msg.topic);
                                            var stm = node.stm[msg.hd];
                                            if (node.mydbConfig.backend) {
                                                stm.run(JSON.parse(msg.topic));
                                            } else {
                                                node.mydbConfig.db.serialize(function () {
                                                    stm.run(JSON.parse(msg.topic));
                                                }.bind(node));
                                            }
                                            msg.payload = { status: 'ok' };
                                            log(node, JSON.stringify(msg.payload));
                                            node.send(msg);
                                        } else {
                                            node.error(new Error("run: unknow statement handle"), msg);
                                        }
                                    } catch (err) {
                                        node.error(err, msg);
                                    }
                                } else
                                    if (msg.type === "step") {
                                        var end;
                                        try {
                                            if ((node.stm !== undefined) && (node.stm[msg.hd] !== undefined)) {
                                                log(node, "hd", msg.hd, " step:", msg.topic);
                                                var stm = node.stm[msg.hd];
                                                if (node.mydbConfig.backend) {
                                                    end = stm.step();
                                                    if (end) { msg.payload = { status: 'ok' }; } else { msg.payload = { status: 'end' }; }
                                                    log(node, JSON.stringify(msg.payload));
                                                    node.send(msg);
                                                } else { /* pas sûr 
                                                    stm.each("",
                                                        function (err, row) { msg.payload = { status: 'ok' }; log(node, JSON.stringify(msg.payload)); node.send(msg); },
                                                        function (err, row) { msg.payload = { status: 'end' }; log(node, JSON.stringify(msg.payload)); node.send(msg); },
                                                    ); */
                                                }
                                            } else {
                                                node.error(new Error("step: unknow statement handle"), msg);
                                            }
                                        } catch (err) {
                                            node.error(err, msg);
                                        }
                                    } else
                                        if (msg.type === "get") {
                                            try {
                                                if ((node.stm !== undefined) && (node.stm[msg.hd] !== undefined)) {
                                                    log(node, "hd", msg.hd, " get:", msg.topic);
                                                    var stm = node.stm[msg.hd];
                                                    var result;
                                                    if (node.mydbConfig.backend) {
                                                        if (msg.topic === "") {
                                                            result = stm.get();
                                                        } else {
                                                            result = stm.get(JSON.parse(msg.topic));
                                                        }
                                                        msg.payload = result;
                                                        log(node, JSON.stringify(msg.payload));
                                                        node.send(msg);
                                                    } else {
                                                        if (msg.topic === "") {
                                                            node.mydbConfig.db.serialize(function () {
                                                                var stm = this.stm[this.msg.hd];
                                                                stm.get("", function (err, row) {
                                                                    if (err) {
                                                                        this.error(err, this.msg);
                                                                    } else {                                                                        
                                                                        this.msg.payload = this.transcode(row);
                                                                        log(this, JSON.stringify(this.msg.payload));
                                                                        this.send(this.msg);
                                                                    }
                                                                }.bind(this));
                                                            }.bind(node));
                                                        } else {
                                                            node.mydbConfig.db.serialize(function () {
                                                                var stm = this.stm[msg.hd];
                                                                stm.get(JSON.parse(msg.topic), function (err, row) {
                                                                    if (err) {
                                                                        this.error(err, this.msg);
                                                                    } else {
                                                                        this.msg.payload = this.transcode(row);
                                                                        log(this, JSON.stringify(this.msg.payload));
                                                                        this.send(msg);
                                                                    }
                                                                }.bind(node));
                                                            });
                                                        }
                                                    }
                                                } else {
                                                    node.error(new Error("get: unknow statement handle"), msg);
                                                }
                                            } catch (err) {
                                                node.error(err, msg);
                                            }
                                        } else
                                            if (msg.type === "free") {
                                                try {
                                                    if ((node.stm !== undefined) && (node.stm[msg.hd] !== undefined)) {
                                                        log(node, "hd", msg.hd, " free");
                                                        var stm = node.stm[msg.hd];
                                                        if (node.mydbConfig.backend) {
                                                            stm.free();
                                                        } else{
                                                            node.mydbConfig.db.serialize(function () {
                                                                var stm = this.stm[msg.hd];
                                                                stm.finalize();
                                                            }.bind(node));
                                                        }
                                                        delete node.stm[msg.hd];
                                                        msg.payload = { status: 'ok' };
                                                        log(node, JSON.stringify(msg.payload));
                                                        node.send(msg);
                                                    } else {
                                                        node.error(new Error("free: unknow statement handle"), msg);
                                                    }
                                                } catch (err) {
                                                    node.error(err, msg);
                                                }
                                            }
                }
                else {
                    node.error("msg.topic : the query is not defined as a string", msg);
                }
            });
        }
        else {
            this.error("Sqlite database not configured");
        }
    }
    RED.nodes.registerType("sqljs", SqljsNodeIn);
}
