# Documenting query "question - response" format

## exec

General format of an exec sequence
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
  
 3. CREATE case
 
   ```
 Q:  exec:CREATE TABLE 'newTable' ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'value' TEXT)
 R: []
  ```
  
## prepare

The format of a prepare sequence follow this pattern

  ```
Q:prepare:<SQL STATEMENT>
R:{"hd":"<handle>"} -- the handle is a lable wich allows to pair Q-R sequence for perpare + statements
(Q:run | get | step
R:{"status":"ok"} or for step {status:'ok'} or {status:'end'} at the last step)+
Q:hd p_657 free
R:{"status":"ok"}
  ```
  
1. UPDATE  case  

  ```
Q:prepare:UPDATE 'Test' SET 'text' = ? WHERE 'Test'.'id' = ?;
R:{"hd":"p_657"}
Q:hd p_657 run:["beige",4]
R:{"status":"ok"}
Q:hd p_657 free
R:{"status":"ok"}
  ```

2. SELECT  case

  ```
Q:prepare:SELECT 'Test'.'text' from 'Test' WHERE 'Test'.'id' = ?;
R:{"hd":"p_1199"}
Q:hd p_1199 get:[4]
R:["beige"]
Q:hd p_1199 free
R:{"status":"ok"}
  ```
