### Scaling Fabric Network

We will scale the Fabric network by increasing the organizations count.

* Generate crypto-materials for 'n' organizations with one peer each. Use crypto-gen tool to do this.
* Generate the orderer genesis block file using the configtxgen tool.
* Generate channel artifact file with all n organizaions in the channel using the configtxgen tool.
* Start the network with 'n' organizations.