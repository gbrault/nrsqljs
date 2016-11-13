# Document query question - response format

## exec
 1. PRAGMA case

```
 exec:PRAGMA table_info('Test')
 [{"columns":["cid","name","type","notnull","dflt_value","pk"],
   "values":[[0,"id","INTEGER",0,null,1],
             [1,"text","TEXT",0,null,0]]}]
             ...
            ]
 ]
 ```
