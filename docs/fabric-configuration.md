## Fabric Configuration

#### The below explanation is taken from the original [Caliper](https://github.com/Huawei-OSG/caliper/blob/master/docs/Fabric%20Configuration.md) source code with some modifications.


The Fabric configuration is a json file which defines a fabric object with below properties:

* **cryptodir**: defines a relative path of the <tt>crypto</tt> directory which contains all cryptographic materials. All paths defined in the configuration file are relative paths to the Fabric root directory. The <tt>crypto</tt> directory structure must be identical with the output of Fabric's <tt>cryptogen</tt> tool. The sub-directories names must match organizations' names defined in the <tt>network</tt> element. The certificates and private keys in this directory are used by FabBench to act as the administrator or the member of corresponding organization to interact with the Fabric network, e.g to create channel, join channel, install chaincode, invoke chaincode, etc.      
 
```json
{"cryptodir": "network/fabric/simplenetwork/crypto-config"}
```
* **fabricVersion**: defines which fabric version gauge should run against.Supported values are 1.0, 1.1, 1.2, 1.3 and 1.4

* **network**: defines the information of orderers and peers of the Fabric network. Structure your network object based on number of connections a client would make. The key of organization objects and peer objects must start with 'org' and 'peer'. If you are running the benchmarking clients on multiple machines, then only add the details of those organizations with which the client will be communicating.
```json
{
  "network": {
    "orderer": {
      "url": "grpcs://localhost:7050",
      "mspid": "OrdererMSP",
      "msp": "network/fabric/simplenetwork/crypto-config/ordererOrganizations/example.com/msp/",
      "server-hostname": "orderer.example.com",
      "tls_cacerts": "network/fabric/simplenetwork/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
    },
    "org1": {
      "name": "peerOrg1",
      "mspid": "Org1MSP",
      "msp": "network/fabric/simplenetwork/crypto-config/peerOrganizations/org1.example.com/msp/",
      "ca": {
        "url": "https://localhost:7054",
        "name": "ca-org1"
      },
      "peer1": {
        "requests": "grpcs://localhost:7051",
        "events": "grpcs://localhost:7053",
        "server-hostname": "peer0.org1.example.com",
        "tls_cacerts": "network/fabric/simplenetwork/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
      },
      "peer2": {
        "requests": "grpcs://localhost:7057",
        "events": "grpcs://localhost:7059",
        "server-hostname": "peer1.org1.example.com",
        "tls_cacerts": "network/fabric/simplenetwork/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt"
      },
      "adminCryptoPath": {
		"certPath":"peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts",
		"keyPath":"peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore"
	 }
    }
  }    
}
```    
```
You can skip the CA url and CA name. The benchmarking tool will not be using the CA. 
```

* **channel**: defines one or more channels used for the experiment. The defined channels can be created automatically by calling *Blockchain.init()* function. The binary Tx file created by the Fabric configtxgen tool is used to provide details of the channel. 
```json
{
  "channel": [
    {
      "name": "mychannel",
      "config": "network/fabric/simplenetwork/mychannel.tx",
      "organizations": ["org1", "org2"]
    }
  ]
}
```

* **chaincodes**: defines one or more chaincodes. The chaincodes can ben installed and instantiated on all peers of the specific channel by calling *Blockchain.installSmartContract()* function.
```json
{
  "chaincodes": [
    {
      "id": "drm", 
      "path": "contract/fabric/drm", 
      "version": "v0", 
      "channel": "mychannel",
      "args":[]
    }
  ]
}
```
* **endorsement-policy**: defines the endorsement policy for all the chaincodes. Currently, only one policy can be defined and the policy is applied to all chaincodes.    
```json
{
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
          "name": "member",
          "mspId": "Org2MSP"
        }
      }
    ],
    "policy": { "2-of": [{"signed-by": 0}, {"signed-by": 1}]}
  }
}
```

* **context**:defines a set of contexts to inform FabBench about the Fabric channel that will be used in the test. The context name(key) is the name of the test round defined by *test.rounds[x].cmd* in the test configuration file.
```json
{
  "context": {
    "invoke": ["mychannel"],
    "query": ["mychannel"]
  }
}
```
