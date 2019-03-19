## Running Micro-Benchmarks For Hyperledger Fabric
 All micro benchmarks should be performed with 1 peer and 1 benchmarking client instance. 
 Set up the Kafka MQ cluster on a different machine.

### 1. Transaction Read-Write Set Size 
Each Fabric transaction contains a read-write set. The read set includes the set of keys that were read by the transaction and the write set contains a set of key-value pairs that were written by the transaction. In this experiment we will meausre the effect of increase in R-W set on throughput. 
The R-W set chaincode generates specified number of R-W set inside the invoke function. 

#### Steps
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Set up the kafka MQ cluster on a different machine.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
   * Pre-populate the KVS. [Click here](./prepopulate-doc.md) to learn how to pre-populate the Keys using the script provided.
   * cd `benchmark-tool/benchmark/fabric/rw-set`
   * Run `node simple.js config-RW-set.json` to start the test. 
   * To generate different number of R-W set, pass a different chaincode argument in `config-RW-set.json` file.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds. 


### 2. Key-Value Store Size 
This test measures effect of the size of the key value store of chaincode data on read and write latencies. In this experiment we will deploy the Key-value store chaincode and pre-populate keys in it. After some keys are pre-populated, we will perform read and then write and note the latencies in each case. 

#### Steps
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Set up the kafka MQ cluster on a different machine.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
   * Pre-populate the KVS. [Click here](./prepopulate-doc.md) to learn how to pre-populate the Keys using the script provided. 
   * `cd benchmark-tool/benchmark/fabric/kv-store` 
   * Run `node simple.js config-KV-store-read.json` to run the Read test.
   * Run `node simple.js config-KV-store-write.json` to run the Write test.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds.  

### 3. Chaincode Payload & Event Payload Size 
In these set of experiments we will study the effect of Chaincode payload sizes on the transaction latency. These set of experiments are setup to measure the latencies for both cases. (a) Varying payloads are sent to a chaincode function that uses the payloads as values to be inserted in the chaincode KV store and (b) In addition to updating the KV store, the payload is passed back in an event generated from the chaincode. The payload is passed from the peer to the client listener.

#### Steps
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Set up the kafka MQ cluster on a different machine.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
  * cd `benchmark-tool/benchmark/fabric/chaincode-payload-size`. 
  * Run `node simple.js config-payload-size-without-events.json` to run the test (a).
  * Run `node simple.js config-payload-size-with-events.json` to run the Read test (b).
  * Edit both `config-payload-size-without-evnnts.json` && `config-payload-size-with-events.json` to provide variable length payloadSize in bytes to test for varying payload.

### 4. Inter-Chaincode Calls 
In these set of experiments, we study how multi-level invocation of chaincodes compares with a single monolithic chaincode incorporating all the functions. We will conduct these experiments invocation depths of 2, 3 and 4. Depth of 1 indicates a client invoking a chaincode function. For Chaincode-Chaincode Read we will perform experiments with depth 2 and for writes depths of 2,3 and 4. Inter-channel allows only read between the chaincode whereas intra channel allows both reads and writes between the chaincodes. So we will divide this section into three sub experiments:
a) Inter-channel Read
b) Intra-channel Read
c) Intra-channel Write
d) Nested calls within a single chaincode

#### Steps : Inter-channel Read
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script. 
   * Pre-populate the KVS. [Click here](./prepopulate-doc.md) to learn how to pre-populate the Keys using the script provided.
   * cd `benchmark-tool/benchmark/fabric/Inter-channel Read`
   * Run `node simple.js config-inter-channel-CC-read.json` to run the Read test.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds. 

#### Steps : Intra-channel Read
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script. 
   * Pre-populate the KVS. [Click here](./prepopulate-doc.md) to learn how to pre-populate the Keys using the script provided.
   * cd `benchmark-tool/benchmark/fabric/Intra-channel Read`
   * Run `node simple.js config-intra-channel-CC-read.json` to run the Read test.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds. 

#### Steps : Intra-channel Write
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
   * cd `benchmark-tool/benchmark/fabric/Inter-channel Write`. 
   * Run `node simple.js config-intra-CC-write-depth2.json` to run the Write test with depth2.
   * Run `node simple.js config-intra-CC-write-depth3.json` to run the Write test with depth3.
   * Run `node simple.js config-intra-CC-write-depth4.json` to run the Write test with depth4.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds.  

#### Steps : Nested calls within a single chaincode
   * Set up the basic hyperledger fabric v1.x network with 1 org (1 peer) and solo orderer.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script.
   * cd `benchmark-tool/benchmark/fabric/Single-chaincode Write`. 
   * Run `node simple.js config-nested-write-depth1.json` to run the Write test with depth1.
   * Run `node simple.js config-nested-write-depth2.json` to run the Write test with depth2.
   * Run `node simple.js config-nested-write-depth3.json` to run the Write test with depth3.
   * Run `node simple.js config-nested-write-depth4.json` to run the Write test with depth4.
   * Change the `config-*.json` files appropriately to run test for desired number of rounds. 
  
