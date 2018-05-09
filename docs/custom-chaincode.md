## Running experiments with custom chaincodes & other variations

### Steps
1. Start the Hyperledger network.
2. If you already have instantiated your chaincode then jump to step no 4.
3. Deploy the custom chaincode
  * cd `deployment-script`
  * Place your chaincode at `deployment-script/src/contract/fabric/<your-chaincode-folder-name>/chaincode-file`
  * Edit the `fabric.json` file accordingly to reflect the chaincode name, version, path, Endorsement policy, channel name present at deployment-script/deployment directory. Make sure that channel name is specified under context section of the `fabric.json` . 
  * Run `node simple.js`
4. Perform the benchmarking experiment
  * cd benchmark/fabric/benchmark_name. For e.g. cd benchmark/fabric/write to perform write-only benchmark
  * Edit the `fabric.json` file accordingly to reflect the chaincode name, version, path, Endorsement policy, channel name present at  benchmark/benchmark_name. Make sure that channel name is specified under context section of the `fabric.json` . (You can use the same file edited in step no 3)
  * Edit the arguments section of the`config.json` file. Give valid chaincode name, function name and arguments list. Make sure that the first element in the arguments.args array is the chaincode function name followed by the arguments list in a json format. 
  * Run `node simple.js open-write-only.json` 


