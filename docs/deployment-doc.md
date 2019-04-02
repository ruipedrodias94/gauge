## Deployment Script for Hyperledger Fabric
We must run the deployment script every time we start a new network. The script takes input as the `fabric.json` file located at benchmark-tool/benchmark/fabric/<bemchmark-name> to create, join channels, install, instantiate smart contracts as defined in the configuraion file. The default `fabric.json` has configuration for a single channel and a single chaincode with Endorsement policy = 2 out of 2. The channel name is `mychannel` and channel artifact file name is `mychannel.tx` You can edit the file to support multiple chaincode and channels with custom Endorsement policy.
In normal scenarios the deployment script would reside on a separate machine.


## Build

### Pre-requisites for deployment script

Make sure following tools are installed
* NodeJS 6.9.X or greater (tested with 6.10.2)

    * cd `deployment-script/fabric`
    * Run `npm install` to install dependencies locally

## Steps
* Place your channel artifact file at `network/fabric-v1.x/simplenetwork` depending on the fabric version against which the benchmarks are running.
* cd `benchmark-tool/benchmark/fabric/<benchmark-name>`. E.g: If you are performing deployment for Write-only experiment then switch to `benchmark-tool/benchmark/fabric/write`
* Edit the `fabric.json` with correct network related details like URL, MSP path,channel name, channel artifact file path etc. Chaincode name and path is configured properly according to the type of benchmark.
* copy the `fabric.json` to `deployment-script/fabric/deployment` directory.
* cd  `deployment-script/fabric/deployment`
* Run `node simple.js`
* Repeat the above steps for different type of benchmark by editing and copying the `fabric.json` file from appropriate <benchmark-type> directory to the `deployment-script/fabric/deployment` directory. Please ensure that the network is restarted before running the deployment-script for any benchmark.

```
Note: In case you face REQUEST_TIMEOUT error after running the above deployment script then run below command from the deployment directory to resolve the error.
```
* ```  node rereun.js ```

