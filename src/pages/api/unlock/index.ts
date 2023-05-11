import { AuthenticatedRequest } from '@/lib/auth.middleware';
import Contract from '@/lib/db/contract';
import db from '@/lib/mongo';
import { ethers } from 'ethers';
import type { NextApiResponse } from 'next';
import * as ethSigUtil from 'eth-sig-util';
import KeyAccess from '@/lib/db/key-access';
import Lock from '@/lib/db/lock';
import { LockHelper } from '@/lib/locks/locks';
import { ELock } from '@/pages/lock/create';
import CryptoJS from 'crypto-js';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await db();
  const { message, signature } = req.body;

  const regex = /Collection:\s*(\w+)\s*Token:\s*(\d+)/;
  const match = message.match(regex);

  const contractAddress = match[1];
  console.log(contractAddress, 'contract addrsdsdsess');
  const contract = await Contract.findOne({
    address: ethers.utils.getAddress(contractAddress),
  });
  console.log(contract, 'contract');
  if (!contract) throw new Error();
  const tokenId = match[2];
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.JSON_RPC_URL
  );
  const web3Contract = new ethers.Contract(contract.address, ABI, provider);
  const msgParams = {
    data: req.body.message,
    sig: req.body.signature,
  };
  const wallet = ethers.utils.getAddress(
    await ethSigUtil.recoverPersonalSignature(msgParams)
  );

  const nftOwner = await web3Contract.ownerOf(1);
  if (ethers.utils.getAddress(nftOwner) !== wallet) throw new Error('BadOwner');
  const ownerSignature = await web3Contract.tokenSignatures(Number(tokenId));
  const isBlacklisted = await web3Contract.blacklistedSignatures(
    ownerSignature
  );
  if (isBlacklisted) throw new Error('Blacklisted');
  const types = {
    Key: [
      { name: 'tokenUri', type: 'string' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
    ],
  };
  const contractOwner = await web3Contract.owner();
  const keyAccess = await KeyAccess.findOne({ signature: ownerSignature });
  if (!keyAccess) throw new Error('KeyAccessNotFound');
  const signer = ethers.utils.verifyTypedData(
    {
      name: 'NFKey',
      version: '1',
      verifyingContract: contract.address,
      chainId: 80001,
    },
    types,
    {
      tokenUri: keyAccess?.tokenUri,
      startTime: keyAccess?.startTime,
      endTime: keyAccess?.endTime,
    },
    ownerSignature
  );

  if (
    ethers.utils.getAddress(signer) !== ethers.utils.getAddress(contractOwner)
  )
    throw new Error('Bad Owner');

  const currentTime = new Date().getTime();
  let canUnlock = false;
  console.log(
    keyAccess?.startTime === 0 || currentTime >= keyAccess.startTime,
    keyAccess?.endTime === 0 || currentTime <= keyAccess.endTime
  );
  if (
    (keyAccess?.startTime === 0 || currentTime >= keyAccess.startTime) &&
    (keyAccess?.endTime === 0 || currentTime <= keyAccess.endTime)
  ) {
    canUnlock = true;
  }
  if (!canUnlock) throw new Error('Unable to unlock');

  //@ts-ignore
  const lockId = contract.metadata.lock;

  const lock = await Lock.findById(lockId);
  if (!lock) throw new Error('');
  const apiKey = CryptoJS.AES.decrypt(lock?.apiKey, 'SecretKey245').toString(
    CryptoJS.enc.Utf8
  );

  const lockHelper = new LockHelper(lock.type as ELock, apiKey);
  //@ts-ignore
  const lockData = await lockHelper.lock?.getLock(lock.metadata.id);
  const lockStatus = lockData?.data.state.state;
  console.log(lockData?.data.state);

  if (lockStatus === 3 || lockStatus === 5)
    //@ts-ignore
    await lockHelper.lock?.lock(lock.metadata.id);
  else if (lockStatus === 1)
    //@ts-ignore
    await lockHelper.lock?.unlock(lock.metadata.id);
  // TODO recover signature
  console.log({ canUnlock });
  res.status(200).send({ canUnlock });
}

export default handler;

const ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'tokenSignatures',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'blacklistedSignatures',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
