# Gauge - Performance benchmarking tool for Hyperledger Fabric and Quorum 

This tool is a performance benchmarking tool built for characterizing the performance of Hyperledger Fabric platform(v1.0 - v1.4) and Quorum v2.0.0. The benchmarking engine is forked off Caliper (currently <a href="https://github.com/hyperledger-archives/caliper/tree/master/src">Hyperledger Caliper</a>), developed by Huawei Technologies. Tool includes modifications to the Caliper Benchmarking engine to be able to send transactions at high send rates. Modifications to the original Caliper source code are listed [here](./docs/caliper-changes.md).

This tool comprises of the following tests:

* Controlled workloads that measure the throughput and latency of the blockchain.
* Micro-benchmarks that tune transaction and chaincode parameters to study its effect on transaction latency.
* Scaling tests that study the impact of scaling chaincodes, channels and peers in the network, on system throughput and latency. 

Supported Performance metrics:
*	Throughput (TPS) - The number of transactions that are successfully committed by the blockchain per second.
*	Transaction confirmation latency - The round trip time from the client submitting a transaction to the time the client receives an event confirmation from the peer.
*	Resource consumption on peers (CPU and memory) - Amount of memory and CPU utilized on the peers.

## Hyperledger Fabric v1.0 - v1.4

The tool can be used to test for specific Fabric deployments with custom orderer settings and application chaincodes with customized endorsement policies.

## Quorum

The tool has Quorum plugin hence can also be used to benchmark Quorum platform. Benchmarks including workload experiments, transaction and payload size experiments, private state experiments and contract state key value experiments. Current tool is tested against Quorum v2.0.0.

Jump to:
* [Design Document](./docs/design-document.md)
* [Anatomy](./docs/tool-anatomy.md)
* [Installation](./docs/installation.md)
* [Running Hyperledger Fabric Benchmarks](./docs/running-expts.md)
* [Running Quorum Benchmarks](./docs/quorum-running-expts.md)


## Contributors
* [Amol Pednekar](https://github.com/amolpednekar) <br>
* Arati Baliga <br>
* [Dinesh Rivankar](https://github.com/dineshrivankar) <br>
* [Nitesh Solanki](https://github.com/nitesh7sid) <br>
* [Pandurang Kamat](https://github.com/pandurangk) <br>
* [Subhod I](https://github.com/subhodi) <br>
