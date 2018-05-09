### Pre-populate KVS in chaincode 
To run some of the benchamarks like Read-only, Key-Value store, Read-Write set and Chaincode-chaincode Read we will have to pre-populate some keys in the chaincode before we perform any tests. There is a `pre-populate.js` script provided which will populate some keys in the chaincode. The chaincode ID, channel name and all the fabric related configuraion details is read from `fabic.json` file . 

 `pre-populate.js` takes three command line argumemts.
 * First argument will tell the script the type of operation to perform. Accepted values are `-a` to add keys and `-q` to query.
 * Second argument is the total number of keys to be populated. e.g. 100
 * Third argument is the granularity which determines the loop counter inside the chaincode functon where the key is populated. If we wish to populate total of 1000 keys with granulatiry of 100 keys per function call then the command will look like  `node pre-populate.js -a 1000 100` . This will populate total of 1000 keys within 100 transactions.

### STEPS
 * cd `benchmark-tool/fabric/<benchmark-name>`
 * Run  `node pre-populate.js -a <total keys> <granularity>`

 chaincode will populate keys starting from `accountno_0`,...`accountno_999`