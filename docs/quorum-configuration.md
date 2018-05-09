## Quorum Configuration

The Quorum configuration is a json file which defines a Quorum object with below properties:

* **network**: Defines the information of peers of the Quorum network. Structure your network object based on number of connections a client would make. Client selects the node to connect using environment variable `CURRENT_NODE` and this node value has to be defined in quorum.json file.
```json
{
	"network": {
			"node1": {
				"httpProvider": {
					"url": "http://localhost:22000"
				},
				"publicKey": "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
				"targetParty": [
					"QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
					"oNspPPgszVUFw0qmGFfWwh1uxVUXgvBxleXORHj07g8="
				]
			},
			"node2": {
				"httpProvider": {
					"url": "http://localhost:22000"
				},
				"publicKey": "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
				"targetParty": [
					"BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
					"oNspPPgszVUFw0qmGFfWwh1uxVUXgvBxleXORHj07g8="
				]
			},
			"node3": {
				"httpProvider": {
					"url": "http://localhost:22000"
				},
				"publicKey": "oNspPPgszVUFw0qmGFfWwh1uxVUXgvBxleXORHj07g8=",
				"targetParty": [
					"BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
					"QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc="
				]
			},
			"development": {
				"httpProvider": {
					"url": "http://localhost:22000"
				},
				"publicKey": "oNspPPgszVUFw0qmGFfWwh1uxVUXgvBxleXORHj07g8="
			}
    }
}
```    
```
You can skip the publicKey and targetParty if using Public state. 
```

* **contracts**: Array defines one or more contracts. The smart contracts can be deployed using [deployment-script](../deployment-script/quorum) or append the contract details with address if already deployed.
```json
{
		"contracts": [
			{
				"name": "simple",
				"experimentName": "simple",
				"abi": [
					{
						"constant": false,
						"inputs": [
							{
								"name": "_key",
								"type": "string"
							},
							{
								"name": "_value",
								"type": "bytes32"
							}
						],
						"name": "open",
						"outputs": [],
						"payable": false,
						"stateMutability": "nonpayable",
						"type": "function"
					},
					{
						"constant": true,
						"inputs": [
							{
								"name": "_key",
								"type": "string"
							}
						],
						"name": "query",
						"outputs": [
							{
								"name": "",
								"type": "bytes32"
							}
						],
						"payable": false,
						"stateMutability": "view",
						"type": "function"
					}
				],
				"path": "quorum/contracts/simple/simple.sol",
				"address": "0x10ae69385c79ef3eb815ac008a7013d6878f1d38",
				"privateFor": [
					"QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
					"oNspPPgszVUFw0qmGFfWwh1uxVUXgvBxleXORHj07g8="
				],
				"bytecode": "0x608060405234801561001057600080fd5b50610213806100206000396000f30060806040526004361061004b5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166365ff45d681146100505780637c261929146100ad575b600080fd5b34801561005c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526100ab94369492936024939284019190819084018382808284375094975050933594506101189350505050565b005b3480156100b957600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526101069436949293602493928401919081908401838280828437509497506101809650505050505050565b60408051918252519081900360200190f35b806000836040518082805190602001908083835b6020831061014b5780518252601f19909201916020918201910161012c565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092209290925550505050565b600080826040518082805190602001908083835b602083106101b35780518252601f199092019160209182019101610194565b51815160209384036101000a60001901801990921691161790529201948552506040519384900301909220549493505050505600a165627a7a7230582004307c6b389aa46aa6fa030a8edb9d05490e5ecd856617c31b3e8d0947c97a2e0029"
      }]
}
```
