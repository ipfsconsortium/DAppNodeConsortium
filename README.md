# DAppNodeConsortium
Dappnode package responsible for IPFSConsortium specifically to pin the DAppNode files 

# Installing on DappNode

The link to install the IPFS Pinning consortium on DappNode (v0.0.1) is 

`/ipfs/QmXVaWaW9CyTpx6CU4hP9M7Tg9eAvagnf4WCWuqokD1AEu`

# Updating the package

Simply run

```
npm install
node generate_dappnode_package.js
```

This will generate a new docker image containing the master branch of the IPFSConsortium and the manifest.json and upload all this to IPFS.

The script ends with an IPFS hash , which can be used to install the package on the DappNode.

```
...
IPFS upload: { path: 'ipfsconsortium.dnp.dappnode.eth_0.0.1.tar.xz',
  hash: 'QmVtCsEiKiKrCaW33gg7Q4asnDpJeuspmRTDccSQLN28S9',
  size: 23770912 }
uploadManifest...
./build_0.0.1/dappnode_package.json
Manifest uploaded! QmXVaWaW9CyTpx6CU4hP9M7Tg9eAvagnf4WCWuqokD1AEu
```

# Thanks

Big thanks to [Eduardo Antuña Díez](https://github.com/eduadiez) for all the help in getting this first DappNode App up and running !


