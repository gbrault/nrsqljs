
module.exports = function(RED) {
    "use strict";
    var reconnect = RED.settings.sqliteReconnectTime || 20000;
    var SQL = require('sql.js');
    var fs = require('fs');
    var path = require('path');
    var express = require('express');

    var log= function(node){
        var i;
        
        if((node!==undefined)&&(node!==null)&&(node.loging!==undefined)&&(node.loging===false)) return;
        
        var keys = Object.keys(arguments);
        var show="";
        for(i=1; i<keys.length;i++){
            if(arguments[keys[i]].length>100)
                show = show.concat(arguments[keys[i]].substr(0,200)+"...");
            else
                show = show.concat(arguments[keys[i]]);
        }
        var ts = new Date();
        var n = ts.toString();
        n=n.substr(n.indexOf(" ")+1);
        n=n.substr(0,n.indexOf("("));
        console.log(n+" "+show);
    };

    log(null,"./ = %s", path.resolve("./"));
    var dir=path.resolve(__dirname,'jade');
    log(null,dir);
    var app = RED.httpNode;
    app.use('/jade', express.static(dir));

    log(null,"Def: SqljsNodeDB");

    function SqljsNodeDB(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        log(node,"Node created: SqljsNodeDB");

        this.dbname = n.db;        

        node.doConnect = function() {
            log(node,"connect to:"+node.dbname);
            var filebuffer=null;
          try{
                filebuffer =fs.readFileSync(node.dbname);
                node.db = new SQL.Database(filebuffer);
                if (node.tick) { clearTimeout(node.tick); }
                log(node,"opened "+node.dbname+" ok");            
            }
            catch(err){
                node.error("failed to open "+node.dbname, err);
                node.tick = setTimeout(function() { node.doConnect(); }, reconnect);
            }
        }

        node.on('close', function () {
            if (node.tick) { clearTimeout(node.tick); }
            if (node.db) { node.db.close(); }
        });
    }
    RED.nodes.registerType("sqljsdb",SqljsNodeDB);

    log(null,"Def: SqljsNodeIn");

    function SqljsNodeIn(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        
        this.loging = n.loging;
        this.mydb = n.mydb;
        this.mydbConfig = RED.nodes.getNode(this.mydb);

        if (this.mydbConfig) {
            this.mydbConfig.doConnect();            
            node.on("input", function(msg) {
                if ((typeof msg.topic === 'string')&&(typeof msg.type === 'string')) {                    
                    if(msg.type==="export") {
                        log(node,"export");
                        var data = node.mydbConfig.db.export();
                        var buffer = new Buffer(data);
                        fs.writeFileSync(node.mydbConfig.dbname, buffer);
                    } else
                    if(msg.type==="exec"){
                        //var bind = Array.isArray(msg.payload) ? msg.payload : [];
                        try{
                            log(node,"exec:",msg.topic);
                            var res = node.mydbConfig.db.exec(msg.topic);
                            msg.payload = res;
                            log(node,JSON.stringify(msg.payload));
                            node.send(msg);                          
                        } catch (err){
                            node.error(err,msg);
                        }
                    } else 
                    if(msg.type==="prepare"){
                        try{
                            log(node,"prepare:",msg.topic);
                            var stm = node.mydbConfig.db.prepare(msg.topic);
                            if(node.stm===undefined){
                                node.stm={};
                            }
                            var index = Math.floor((Math.random() * 10000) + 1); // Object.keys(node.stm).length;
                            log(node,"prepare: hd=",'p_'+index),
                            node.stm['p_'+index]=stm;
                            msg.payload={hd:'p_'+index};
                            log(node,JSON.stringify(msg.payload));
                            node.send(msg);
                        } catch (err){
                            node.error(err,msg);
                        }
                    }
                    if(msg.type==="run"){
                        try{
                            if((node.stm!==undefined)&&(node.stm[msg.hd]!==undefined)){
                                log(node,"hd",msg.hd," run:",msg.topic);
                                var stm = node.stm[msg.hd];
                                stm.run(JSON.parse(msg.topic));                                                            
                                msg.payload={status:'ok'};
                                log(node,JSON.stringify(msg.payload));
                                node.send(msg);
                            } else {
                                node.error(new Error("run: unknow statement handle"),msg);
                            }
                        } catch (err){
                            node.error(err,msg);
                        }
                    }                     
                    if(msg.type==="step"){
                        var end;
                        try{
                            if((node.stm!==undefined)&&(node.stm[msg.hd]!==undefined)){
                                log(node,"hd",msg.hd," step:",msg.topic);
                                var stm = node.stm[msg.hd];
                                end=stm.step();
                                if(end){
                                    msg.payload={status:'ok'};
                                } else {
                                    msg.payload={status:'end'};
                                }                                                                                
                                log(node,JSON.stringify(msg.payload));
                                node.send(msg);
                            } else {
                                node.error(new Error("step: unknow statement handle"),msg);
                            }
                        } catch (err){
                            node.error(err,msg);
                        }
                    }                     
                    if(msg.type==="get"){
                        try{
                            if((node.stm!==undefined)&&(node.stm[msg.hd]!==undefined)){
                                log(node,"hd",msg.hd," get:",msg.topic);
                                var stm = node.stm[msg.hd];
                                var result;
                                if(msg.topic===""){
                                    result = stm.get();
                                } else {
                                    result = stm.get(JSON.parse(msg.topic));
                                }
                                 
                                msg.payload=result;
                                log(node,JSON.stringify(msg.payload));
                                node.send(msg);                               
                            } else {
                                node.error(new Error("get: unknow statement handle"),msg);
                            }                                                      
                        } catch (err){
                            node.error(err,msg);
                        }
                    }                     
                    if(msg.type==="free"){
                        try{
                            if((node.stm!==undefined)&&(node.stm[msg.hd]!==undefined)){
                                log(node,"hd",msg.hd," free");
                                var stm = node.stm[msg.hd];
                                stm.free();
                                delete node.stm[msg.hd];
                                msg.payload={status:'ok'};
                                log(node,JSON.stringify(msg.payload));
                                node.send(msg);
                            } else {
                                node.error(new Error("free: unknow statement handle"),msg);
                            } 
                        } catch (err){
                            node.error(err,msg);
                        }
                    }                  
                }
                else {
                    if (typeof msg.topic !== 'string') {
                        node.error("msg.topic : the query is not defined as a string",msg);
                    }
                }
            });
        }
        else {
            this.error("Sqlite database not configured");
        }
    }
    RED.nodes.registerType("sqljs",SqljsNodeIn);
}
