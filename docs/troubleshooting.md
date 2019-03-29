## Troubleshooting

Troubleshooting guide for Gauge and its extra dependencies such as Apache Kafka MQ.

### Error 1: 
``` npm ERR! pkcs11js@1.0.15 install: node-gyp rebuild``` 
```npm ERR! Exit status 1```
```npm ERR! ```
### Solution
Run `sudo apt-get install build-essential`

### Error 2: 
``` The gRPC binary module was not installed. This may be fixed by running "npm rebuild ``` 
### Solution
Run `npm rebuild`

### Error 3:
``` error: [E2E testing]: Error while consuming blocks from MQ topic=client-b, partition=0, message=Unknown ```
### Solution
Change the following property in [docker-compose-kafka.yaml](../kafka-setup/docker-compose-kafka.yaml) file to increase the heap size
``` - KAFKA_HEAP_OPTS= -Xms1g -Xmx2g ```

