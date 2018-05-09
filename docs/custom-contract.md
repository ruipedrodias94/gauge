## Running experiments with custom chaincodes & other variations

### Steps
1. Start the Quorum network.
2. If you already have deployed your contract then jump to step no 4.
3. Deploy the custom chaincode
  * cd `deployment-script`
  * Place your contract at `deployment-script/quorum/contracts/<your-contract-folder-name>/contract-file`
  * Edit the `quorum.json` file accordingly to reflect the contract name, address, ABI, bytecode and path.
  * Run `CURRENT_NODE="node1" node deploy.js quorum.json`
4. Perform the benchmarking experiment
  * cd benchmark/quorum/benchmark_name. For e.g. cd benchmark/quroum/write to perform write-only benchmark
  * Edit the `quorum.json` file accordingly to reflect the contract name, address, ABI, bytecode and path. (You can use the same file edited in step no 3)
  * Edit the arguments section of the`config.json` file. Give valid contract name(cmd) and arguments list.
  * Run `node simple.js config-quorum-open.json` 
