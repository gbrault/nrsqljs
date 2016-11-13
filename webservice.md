# Document query question - response format

## exec

  ```
 Q: exec: <SQL STATEMENT: PRAGMA, SELECT...>
 R: [ "columns": [<"string">+]
      "values": [
                  [<value>+],
                  [<value>+],
                  ...
                ]
    ]
  values has the same number of items than columns for each sub array = rows
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
