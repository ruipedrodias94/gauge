## Run Benchmarks For Hyperledger Fabric
`Note:` 
* `Before you proceed further, please read the section ` [tool-anatomy](./tool-anatomy.md) ` to have a clear understanding of the Gauge framework code.`
* `Before running any experiment make sure that the benchmark client installation was completed successfully without any errors.`
* `Edit the` [kafka-config.json](../benchmark-tool/listener/kafka-config.json) ` file with the correct Kafka broker & ZooKeeper URL along with the unique topic for each benchmarking client instance.`

* **Controlled Workloads:** Throughput(TPS) and latency measurements ([Run controlled workloads](./controlled-workload.md))
    * Different types of workloads - Write-only, Read-only, Null-workload and Mix-workload
    * Tuning orderer batch size
    * Tweaking Chaincode Endorsement Policy

* **Micro-benchmarks:** Transaction latency measurements ([Run Micro-benchmarks](./micro-benchmarks.md))
    * Read-Write Set - Measures the transaction latency with different read-write set sizes.
    * Key-Value Store - Measures read and write transaction latencies with varied size key-value stores.
    * Chaincode and Event payload - Measures the transaction latency with variations in the transaction and event payload sizes.
    * Inter chaincode calls - Measures the execution overhead of inter-chaincode calls for different call depths.

* **Scalability experiments:** Throughput and latency measurements ([Run Scalability experiments](./scalability-experiments.md))
    * Chaincode Scalability - Increasing the number of chaincodes.
    * Channel Scalability - Increasing the number of channels.
    * Fabric Peer Scalability - Increasing the number of Organizations.

All predefined benchmarks for fabric can be found in the [benchmarking-tool](../benchmark-tool/benchmark/fabric) folder.

## Interpreting Output 
#### [Learn about the output generated](./output-explaination.md)

## Customize for your application
#### [Running experiments with custom chaincode](./custom-chaincode.md)

## Troubleshooting
###Refer [here](./troubleshooting.md).
