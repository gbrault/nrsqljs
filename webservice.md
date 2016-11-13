# Document query question - response format

## exec

  ```
 Q: exec: &lt;SQL STATEMENT: PRAGMA, SELECT...&gt;
 R: [ "columns": [&lt;"string"&gt;+]
      "values": [
                  [&lt;value&gt;+],
                  [&lt;value&gt;+],
                  ...
                ]
    ]
  ```

 1. PRAGMA case
 
  ```
 Q: exec:PRAGMA table_info('Test')
 R: [{ "columns":["cid","name","type","notnull","dflt_value","pk"],
       "values":[ [0,"id","INTEGER",0,null,1],
                  [1,"text","TEXT",0,null,0]]}]
                   ...
                ]
      }
     ]
  ```
  
 2. SELECT case
 
   ```
 Q: exec:select * from 'Test'
 R:  [{"columns":["id","text"],
       "values":[[1,"purple"],[2,"jaune"],[3,"rose"],[4,"blanc"]]
      }
     ]
  ```
