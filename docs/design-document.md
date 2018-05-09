## Gauge Architecture


<img name="architecture" src="./architecture.png" width="70%">

## Client Machine

#### Benchmarking Engine
The benchmarking engine is the core part of the Gauge tool. It generates input transaction load on the blockchain network, monitors the resource consumption on peers, computes transaction throughput and latency metrics.

* <b>Load Generator:</b> Sends transactions to the blockchain network at a given send rate as specified in the configuration files. This component uses the blockchain SDK to send transactions to the blockchain network.
* <b>Blockchain/DLT SDK:</b> Sends transactions to the blockchain network. For Hyperledger Fabric it uses [fabric-sdk-node](https://github.com/hyperledger/fabric-sdk-node) and for Quorum it uses [web3.js](https://github.com/ethereum/web3.js). 
* <b>Block Event Listener:</b> Listens for block events from the blockchain peer. It receives events when new blocks are confirmed on the blockchain network and assigns them a client-side timestamp. The block timestamp represents the confirmation time for all transactions within the block. Timestamped blocks are stored in the Messaging Queue until they are read by the Latency and Throughput Calculator.
* <b>TPS & Latency Calculator:</b> Read blocks from the Messaging Queue to calculate transaction throughput and latency. 
    The transaction throughput and latency are calculated as follows:<br> 
        Throughput (TPS) = Total # of successful transactions / (Confirmation time of last Tx - Confirmation time of first Tx) <br>
        Transaction Latency =  (Confirmation time for the Tx - Send time of the Tx)<br>
* <b>Resource Monitor & Calculator:</b> Monitors the blockchain peers to get CPU and Memory consumption numbers. This component uses the Docker Stats API for fetching the CPU and Memory data. Only peers that are running inside the docker container are supported. 

#### Configuration
Comprises of all the configuration files needed by the benchmarking engine.

* <b>Benchmarking Config:</b> Contains experiment related configuration parameters, such as transaction load, send rate and number of rounds. [Click here](./tool-anatomy.md#the-configjson-file) to learn more about the config in detail.  
* <b>Blockchain/DLT Network Config:</b> Contains blockchain related configuration parameters. It is recommended that while running the benchmarking client in a distributed environment, the blockchain Network Config file only contain the details of the Peer(s) with which it will be interacting.
* <b>MQ Config:</b> Contains the IP addresses of the Kafka broker(s) and Zookeeper(s), and topic names. In a distributed client set up, topic name should be unique for each benchmarking client.

## MQ Machine(s)
The MQ is implemented using Apache Kafka. It can be run on a single or multiple machines to improve efficiency of the messaging queue. The default set up [script](../kafka-setup) will run the Kafka environment on a single machine. The Kafka setup script can be customized to run the setup on multiple machines. 
MQ is used by the Block Listener module to store the timestamped blocks until they are consumed by the throughput and latency calculator. The blocks are consumed per round of the experiment when the throughput and latency numbers are calculated. 

## Blockchain/DLT Network
The Blockchain/DLT network being performance tested by the Gauge client.