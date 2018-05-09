## Running Controlled Workloads For Hyperledger Fabric
The basic setup listed below has to be completed before running the workload specific steps.
  * Set up the basic Fabric network with 2 organizations (two peers per organization) and a solo orderer. [Click here](./fabric-network-setup.md) to learn about the setup.
  * Set up the Kafka MQ cluster on a different machine.
  * Run the deployment script to create a channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script for a particular benchmark.

### 1. Write-only workload 
This experiment will generate transactions at a specified send rate (defined in config.json), which involve making `invoke` calls to the chaincode.

#### Steps
   * cd `benchmark-tool/benchmark/fabric/write`
   * Run `node simple.js config-write-only.json` 
        If you wish to change the transaction load, send rate, chaincode arguments, please edit the `config-write-only.json` file

### 2. Read-only workload 
This experiment will generate transactions at a specified send rate (defined in config.json), which involve making `query` calls to the chaincode. Make sure the chaincode is pre-populated with the required number of keys.

#### Steps
  * Pre-populate the chaincode key-value store. [Click here](./prepopulate-doc.md) to learn how to pre-populate the Keys using the script provided.
  * cd `benchmark-tool/benchmark/fabric/read`
  * Run `node simple.js config-read-only.json` 
        If you wish to change the txn load, send rate, chaincode args please edit the `config-read-only.json` file

### 3. Null workload 
This experiment is similar to the Write-only workload with only difference is that the chaincode method invoked simply returns. It represents the baseline for write workloads.

#### Steps
   * cd `benchmark-tool/benchmark/fabric/null`
   * Run `node simple.js config-null-workload.json` 
        If you wish to change the txn load, send rate, chaincode args please edit the `config-null-workload.json` file

### 4. Mix workload 
This experiment uses a mixture of read and write transaction in a 50-50 mix.

#### Steps
   * cd `benchmark-tool/benchmark/fabric/mix`
   * Run `node simple.js config-mix-workload.json` 
        If you wish to change the txn load, send rate, chaincode args please edit the `config-mix-workload.json` file

### 5. Tuning orderer parameters
In this experiment we change the Orderer <tt>BatchSize.MessageCount</tt> parameter and tune out the other three parameters namely <tt>BatchTimeout</tt>,  <tt>BatchSize.PreferredMaxBytes</tt> and <tt>BatchSize.AbsoluteMaxBytes</tt>. Once the parameters are adjusted, it can be tested against write, null or mix workloads. 

#### Steps
   * Change the BatchSize.MessageCount parameter defined in configtx.yaml to 250.
   * Set BatchTimeout, PreferredMaxByes, AbsoluteMaxBytes to higher values so that they dont interfere the ordering logic.
   * Create the orderer genesis block file and channel artifacts to make sure that the changed parameters are in effect.
   * Start the network, run [deployment script](./deployment-doc.md). 
   * Repeat the setps for Write-only Controlled workload experiment to see the effect of the orderer batch size on throughput and latency.
   * Repeat the experiment with different values of Batchsize.MessageCount

### 6. Changing  the Endorsement policy of a chaincode and measuring the Throughput & Latency 
In this experiment, we study the effect of the endorsement policy on the latency and throughput at different send rates.
All the previously described Benchmarks are configure with Endorsement policy = 2. In this experiment we will confgure it to 1 and then run Write-only Workload.

#### STEPS
   * Set up the basic Fabric network with 2 organizations (two peers per organization) and a solo orderer. [Click here](./fabric-network-setup.md) to learn about the setup.
   * Set up the Kafka MQ cluster on a different machine.
   * Change the Endorsement policy of the chaincode defined in `fabric.json` file under `benchmark-tool/fabric/write` directory. After change the endorsement policy section will look like :
  ```
      "endorsement-policy": {
        "identities": [
          {
            "role": {
              "name": "member",
              "mspId": "Org1MSP"
            }
          },
          {
            "role": {
              "name": "admin",
              "mspId": "Org1MSP"
            }
          }
        ],
        "policy": {
          "1-of": [
            {
              "signed-by": 0
            }
            
          ]
        }
      }
  ```  
   * Run the deployment script to create a channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
   * cd `benchmark-tool/benchmark/fabric/write`
   * Change the network section in the `fabric.json` to include details of only those organizations with which the client will be communicating. In the above case the client wishes to get endorsement from Org1 so we just need to include Org1 details. The file after modificaton should like [this](../benchmark-tool/benchmark/fabric/write/fabric-EP-1.json).
   * Run `node simple.js config-write-only.json` 
        If you wish to change the transaction load, send rate, chaincode arguments, please edit the `config-write-only.json` file