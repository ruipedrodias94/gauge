## Run Benchmarks
`Note:` 
* `Before you proceed further, please read the section ` [tool-anatomy](./tool-anatomy.md) ` to have a clear understanding of the Gauge framework code.`
* `Before running any experiment make sure that the benchmark client installation was successfully complete without any errors.`
* `Edit the` [kafka-config.json](../benchmark-tool/listener/kafka-config.json) ` file with the correct Kafka broker & ZooKeeper URL along with the unique topic for each benchmarking client instance.`

### Blockchain Peer/Node  and Public/Private transaction type selection.
* **`process.env.CURRENT_NODE` :environment variable is used to fetch the IP of selected node.** <br/>
    ```bash
        $ CURRENT_NODE="node1" npm run quorum-open
    ```
* **All the experiments can be easily performed for both Private and Public state by just changing the environment variable** <br/>
    `process.env.PRIVATE` : environment variable to determine transaction type. <br/>
    ```bash
        $ CURRENT_NODE="node1" PRIVATE=true npm run quorum-open #Private state transactions
        $ CURRENT_NODE="node1" npm run quorum-open #Public state transactions
    ```
### Deployment
Refer [Quorum-depoyment-script](../deployment-script/quorum/) to deploy contracts in network and to update `quorum.json` file.

### Controlled workload experiments
* Each client is connected to single Quorum node.
* Modify network field in [quorum.json](../benchmark-tool/benchmark/quorum/quorum.json) with IPs of blockhain Nodes.
* Refer [package.json](../benchmark-tool/package.json) for scripts
* Run experiments using these pre defined NPM scripts: e.g. **`npm run quorum-open`**
<table>
    <thead>
        <th>NPM script</th>
        <th>Command</th>
        <th>Experiment</th>
    </thead>
    <tbody>
        <tr>
            <td>quorum-open</td>
            <td> node benchmark/quorum/write/simple.js config-quorum-open.json</td>
            <td>Write only workload</td>
        </tr>
        <tr>
            <td>quorum-null</td>
            <td> node benchmark/quorum/null/simple.js config-quorum-null.json</td>
            <td>doNothing/Null workload</td>
        </tr>
        <tr>
            <td>quorum-query</td>
            <td> node benchmark/quorum/read/simple.js config-quorum-query.json</td>
            <td>Read only workload</td>
        </tr>
        <tr>
            <td>quorum-mix</td>
            <td> node benchmark/quorum/mix/simple.js config-quorum-mix.json</td>
            <td>Mix workload</td>
        </tr>
     </tbody>
</table>

### Micro-benchmarking experiments
* Modify network field in [quorum.json](../benchmark-tool/benchmark/quorum/quorum.json) with IPs of blockhain Nodes.
* Refer [package.json](../benchmark-tool/package.json) for scripts
<table>
    <thead>
        <th>NPM script</th>
        <th>Command</th>
        <th>Experiment</th>
    </thead>
    <tbody>
        <tr>
            <td>quorum-micro-payload</td>
            <td> node benchmark/quorum/transaction-event-payload/simple.js config.json</td>
            <td>Transaction Event payload experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-rwset-write</td>
            <td> node benchmark/quorum/read-write-set/simple.js config-write.json</td>
            <td>Read write set-write experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-rwset-read</td>
            <td> node benchmark/quorum/read-write-set/simple.js config-read.json</td>
            <td>Read write set-read experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-kv-write</td>
            <td> node benchmark/quorum/key-val-store/simple.js config-write.json</td>
            <td>Key value store-write experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-kv-read</td>
            <td> node benchmark/quorum/key-val-store/simple.js config-read.json</td>
            <td>Key value store-read experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-nested-write</td>
            <td> node benchmark/quorum/nested-invocation/simple.js config-write.json</td>
            <td>Nested contract invocation-write experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-nested-read</td>
            <td> node benchmark/quorum/nested-invocation/simple.js config-read.json</td>
            <td>Nested contract invocation-read experiment</td>
        </tr>
        <tr>
            <td>quorum-micro-private</td>
            <td> node benchmark/quorum/private-payload/simple.js config.json</td>
            <td>Private contract payload experiment</td>
        </tr>
    </tbody>
</table>

All predefined benchmarks for Quorum can be found in the [benchmarking-tool](../benchmark-tool/benchmark/quorum) folder.

## Interpreting Output 
#### [Learn about the output generated](./output-explaination.md)

## Customize for your application
#### [Running experiments with custom chaincode](./custom-contract.md)
