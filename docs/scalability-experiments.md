## Scalability Experiments


### Chaincode Scalability
In this experiment, we study how the number of chaincodes deployed affect the throughput and latency of the system when all of them are deployed on the same channel and all (or most) of them are invoked at the same time by clients. 

#### STEPS
 
   * Set up the basic hyperledger fabric v1.x network with 2 orgs (2 peers each) and a solo orderer. [Click here](./fabric-network-setup.md) to learn about the setup.
   * Set up the kafka MQ cluster on a different machine.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script. The deployment script will deploy 10 chaincodes by default.
   * `cd benchmark-tool/benchmark/fabric/chaincode-scalability`
   * Run `node simple.js config-chaincode-scalability.json` to start the test.
   * Change the `config-chaincode-scalability.json` file appropriately to run test for desired number of rounds. 
    ```
       Note: 
       a) Arguments section in the `config-chaincode-scalability.json` contains list of chaincodes to be interacted with along with the payload to be sent. Make sure that you also change this file whenever you deploy more chaincodes.
       b) In the config-chaincode-scalability.json file, "txNumbAndTps": [[10,10]] section is interpreted as 10 transactions on 10 different chaincodes. It also means that it will send 10 txns in 1 second. If you wish to run this with 100 chaincodes then change the setting to [100,100]
    
     ```
   
### Channel Scalability
In this experiment, we will create `n` channels and deploy one chaincode in each channel. The experiment will then make one transaction to each chaincode which can be configured in the `config-channel-scalability.json`

#### STEPS

   * Set up the basic hyperledger fabric v1.x network with 2 orgs (2 peers each) and a solo orderer. [Click here](./fabric-network-setup.md) to learn about the setup.
   * Set up the kafka MQ cluster on a different machine.
   * Run deployment script to create channel, join channel, install and instantiate chaincode. [Click here](./deployment-doc.md) to see how to run the deployment script. The deployment script will create 10 channels and deploy 10 chaincodes.
   * `cd benchmark-tool/benchmark/fabric/channel-scalability`
   * Run `node simple.js config-channel-scalability.json` to start the test. 
   * Change the `config-channel-scalability.json` file appropriately to run test for desired number of rounds. 
      ```
       Note: 
       a) Arguments section in the `config-channel-scalability.json` contains list of chaincodes to be interacted with along with the payload to be sent. Make sure that you also change this file whenever you deploy more chaincodes.
       b) In the config-chaincode-scalability.json file, "txNumbAndTps": [[10,10]] section is interpreted as 10 transactions on 10 different chaincodes (10 different channels too). It also means that it will send 10 txns in 1 second. If you wish to run this with 100 chaincodes then change this setting to [100,100]
     
     ```

### Fabric Peer Scalability
In this experiment, we will expand the network with `n` Organizations.

#### STEPS

   * Set up the hyperledger fabric v1.x network with n orgs (1 peer each) and a solo orderer. [Click here](./scaling-fabric-network-setup.md) to learn about the setup. If the network already exists then skip this step.
   * Set up the kafka MQ cluster on a different machine.
   * Run the deployment script:
      * Place the crypto materials at deployment-script/network/fabric/simplenetwork directory.
      * Make appropriate changes to the `fabric.json` file present at deployment-script/deployment directory to reflect the Peer URL, MSP path of peers, admins, channel name, channel artifact file path, Endorsement policy as desired.
      * cd `deployment-script/fabric/deployment`
      * Run node `simple.js`
   * Run any one of this [controlled workload](./controlled-workload.md) experiment.  
      * Place the crypto materials at benchmark-tool/network/fabric/simplenetwork directory.
      * cd `benchmark-tool/benchmark/fabric/write` for performing Write-only experiemnt.
      * Make appropriate changes to the `fabric.json` file to reflect the Peer URL, MSP path of peers, admins.
   * Run `node simple.js config-write-only.json` to start the test. 
   * Change the `config-write-only.json` file appropriately to run test for desired number of rounds. 