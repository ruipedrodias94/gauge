## Gauge Installation

Installation guide for Gauge and its extra dependencies such as Apache Kafka MQ.

For Hyperedger Fabric Network setup [click here](./fabric-network-setup.md)

## Note
``
The Gauge clients and the Kafka MQ should be installed and run on machines separate from the machines running the Fabric nodes (peers and the orderer nodes). This will ensure results obtained are accurate and reliable.  
``

## Build

### Pre-requisites for Gauge Tool

Make sure following tools are installed
* NodeJS 6.9.X or greater (tested with 6.10.2)

    * cd `benchmark-tool`
    * Run `npm install` to install dependencies locally


### Pre-requisites for Kafka MQ

Following tools need to be installed.
* Docker version 17.03.0-ce or greater is required (tested with with 18.02.0-ce)
* Docker-compose version 1.8 or greater is required (tested with with 1.19.0)

    * Clone the file docker-compose-kafka.yaml present in `/kafka-setup` directory on the machine where you want to set up the Kafka cluster.
    * Open the file docker-compose-kafka.yaml and change the `KAFKA_ADVERTISED_HOST_NAME` environment variable to the machine IP address where Kafka will be running. 
    * Run `docker-compose -f docker-compose-kafka.yaml up -d`.
	
#### Troubleshooting
Refer [here](./troubleshooting.md).
