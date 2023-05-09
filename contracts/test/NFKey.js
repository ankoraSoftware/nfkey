const { expect } = require("chai");
const exp = require("constants");
const { sign } = require("crypto");
const { ethers } = require("hardhat");

describe("NFT contract", function () {
  let nfkeyContract;
  let owner;
  let user;
  let signature;

  it("Should define wallets", async () => {
    const [ownerWallet, userWallet] = await ethers.getSigners();
    owner = ownerWallet;
    user = userWallet;
     // Check that owner and user are not the same account
    expect(owner.address).to.not.equal(user.address);
    // Check that owner has a balance of at least 1 ETH
    const ownerBalance = await owner.getBalance();
    expect(ownerBalance).to.be.gt(ethers.utils.parseEther("1"));
 
    // Check that user has a balance of at least 1 ETH
    const userBalance = await user.getBalance();
    expect(userBalance).to.be.gt(ethers.utils.parseEther("1"));
  })
  it("Deployment should assign the deployer to owner", async function () {
    const NFKey = await ethers.getContractFactory("NFKey");

    nfkeyContract = await NFKey.deploy();

    const contractOwner = await nfkeyContract.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("Should create token", async function() {
    await nfkeyContract.connect(owner).createToken(1000, "hash");
    const uri = await nfkeyContract.uri(0);
    expect(uri).to.equal("ipfs://hash")
  });

  it("Should create signature", async function () { 
    const network = await nfkeyContract.provider.getNetwork();

    const domain =  {
      name: 'NFKey',
      version: '1',
      chainId: network.chainId,
      verifyingContract: nfkeyContract.address,
    };

    const types = { Key: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
    ],}

    const key = {
      tokenId: 0,
      amount: 1,
      startTime: 0,
      endTime: 0,
    }   
    // create a signature
    signature = await owner._signTypedData(domain, types, key);
    // verify the signature
    const recoveredAddress = ethers.utils.verifyTypedData(domain, types, key, signature);
    expect(recoveredAddress).to.equal(owner.address);
  });

  it("Should mint nft", async () => {
    
    await nfkeyContract.connect(user).mint([0, 1, 0, 0, signature], "")
  })

});