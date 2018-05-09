## Quorum contract deplyoment
### Command
```bash
$ $ CURRENT_NODE="node1" node deploy.js quorum.json
```
### Description
1. Understanding `quorum.json` file: Refer [quorum-configuartion.md](../../docs/quorum-configuration.md).
2. Run `deploy.js` script to deploy contracts present in [contracts directory](./contracts) and to update contracts addess in `quorum.json` file.
3. Once all the contracts are deployed, copy `quorum.json` file to respective experiment directory(../benchmark-tool/benchmark/quorum/) and start the experiment.
