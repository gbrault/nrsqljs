var SQL=(function(){
    this.SQL={  
        Database:function(){
            return{
                log:function(){
                    return;
                    var keys = Object.keys(arguments);
                    var show = "";
                    for (var key in keys) {
                        if (arguments[key].length > 100)
                            show = show.concat(arguments[key].substr(0, 200) + "...");
                        else
                            show = show.concat(arguments[key]);
                    }
                    var ts = new Date();
                    var n = ts.toString();
                    n = n.substr(n.indexOf(" ") + 1);
                    n = n.substr(0, n.indexOf("("));
                    console.log(n+" "+show); 
               },
                export: function(){
                    this.log("export");
                    var request = new XMLHttpRequest();
                    request.open('GET', '/sqljs?query=export&type=export', false);  // `false` makes the request synchronous
                    request.send(null);

                    if (request.status === 200) {
                        this.log(request.responseText);
                        return JSON.parse(request.responseText);
                    } else {
                        return {error:true,status:request.status};
                    }
                },
                exec: function(query){
                    this.log("exec: ",query);
                    var request = new XMLHttpRequest();
                    request.open('GET', '/sqljs?type=exec&query='+encodeURIComponent(query), false);  // `false` makes the request synchronous
                    request.send(null);

                    if (request.status === 200) {
                        this.log(request.responseText);
                        return JSON.parse(request.responseText);
                    } else {
                        return {error:true,status:request.status};
                    }
                },
                prepare: function(query){
                    this.log("prepare: ",query);
                    var request = new XMLHttpRequest();
                    request.open('GET', '/sqljs?type=prepare&query='+encodeURIComponent(query), false);  // `false` makes the request synchronous
                    request.send(null);

                    if (request.status === 200) {
                        this.log(request.responseText);
                        that = this;
                        return {
                            log: function(){
                                that.log.apply(this,arguments);
                            },
                            run: function(args,hd=JSON.parse(request.responseText)){
                                this.log("run: ",JSON.stringify(args)," hd=",hd);
                                var request = new XMLHttpRequest();
                                request.open('GET', '/sqljs?type=run&hd='+hd.hd+'&query='+encodeURIComponent(JSON.stringify(args)), false);  // `false` makes the request synchronous
                                request.send(null);

                                if (request.status === 200) {
                                    this.log(request.responseText);
                                    return JSON.parse(request.responseText);
                                } else {
                                    return {error:true,status:request.status};
                                }                                    
                            },
                            step: function(args,hd=JSON.parse(request.responseText)){                                
                                var request = new XMLHttpRequest();
                                if(args!==undefined){
                                    this.log("step: ",JSON.stringify(args)," hd=",hd);
                                    request.open('GET', '/sqljs?type=step&hd='+hd.hd+'&query='+encodeURIComponent(JSON.stringify(args)), false);  // `false` makes the request synchronous
                                } else {
                                    this.log("step: hd=",hd);
                                    request.open('GET', '/sqljs?type=step&hd='+hd.hd+'&query=', false);  // `false` makes the request synchronous
                                } 
                                request.send(null);

                                if (request.status === 200) {
                                    this.log(request.responseText);
                                    var result=JSON.parse(request.responseText);
                                    if (result.status==='ok')
                                        return true;
                                    else
                                        return false;
                                } else {
                                    return {error:true,status:request.status};
                                }                                    
                            },
                            get: function(args,hd=JSON.parse(request.responseText)){
                                var request = new XMLHttpRequest();
                                if(args!==undefined){
                                    this.log("get: ",args," hd=",hd);
                                    request.open('GET', '/sqljs?type=get&hd='+hd.hd+'&query='+encodeURIComponent(JSON.stringify(args)), false);  // `false` makes the request synchronous
                                } else {
                                    this.log("get: hd=",hd);
                                    request.open('GET', '/sqljs?type=get&hd='+hd.hd+'&query=', false);  // `false` makes the request synchronous
                                }                              
                                request.send(null);

                                if (request.status === 200) {
                                    this.log(request.responseText);
                                    return JSON.parse(request.responseText);
                                } else {
                                    return {error:true,status:request.status};
                                }                                    
                            },
                            free: function(hd=JSON.parse(request.responseText)){
                                this.log("free: hd=",hd);
                                var request = new XMLHttpRequest();
                                request.open('GET', '/sqljs?type=free&hd='+hd.hd+'&query=', false);  // `false` makes the request synchronous
                                request.send(null);

                                if (request.status === 200) {
                                    this.log(request.responseText);
                                    return JSON.parse(request.responseText);
                                } else {
                                    return {error:true,status:request.status};
                                }                                    
                            }
                        }
                    } else {
                        return {error:true,status:request.status};
                    }
                },
            }
        },
        Statement:function(){

        }
    };
    return this['SQL'];
})();
"undefined"!==typeof module&&(module.exports=SQL);
"function"===typeof define&&define(SQL);
