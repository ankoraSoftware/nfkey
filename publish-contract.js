const { create } = require('ipfs-http-client');
const solc = require('solc');
const fs = require('fs');
const path = require("path")
const dotenv = require("dotenv")

dotenv.config()
function findImports(relativePath)  {
    console.log(relativePath)
    const absolutePath = path.resolve(
      process.cwd(),
      'node_modules',
      relativePath
    );
    const source = fs.readFileSync(absolutePath, 'utf8');
    return { contents: source };
  }
const upload = async () => {
// Read the Solidity smart contract file
const contractFile = fs.readFileSync('./contracts/contracts/NFKey.sol', 'utf8');
const input = {
    language: 'Solidity',
    sources: {
      ["NFKey.sol"]: {
        content: contractFile,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  // Compile smart contract
  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );
// Extract the artifact from the compiled contract
const artifact = output.contracts['NFKey.sol']['NFKey'];

// Create an IPFS node
const ipfs = create({ url: 'https://ipfs.infura.io:5001', headers: {
    authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_IPFS_API_KEY}:${process.env.NEXT_PUBLIC_IPFS_SECRET_KEY}`).toString('base64')}`
  } });
// Upload the bytecode and metadata to IPFS
const artifactCID = await ipfs.add(JSON.stringify(artifact));

console.log(`Artifact uploaded to IPFS with CID: ${artifactCID.cid.toString()}`);

}

upload()