// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from '@/lib/auth.middleware';
import Nft from '@/lib/db/nft';
import db from '@/lib/mongo';
import type { NextApiResponse } from 'next';
import Contract from '@/lib/db/contract';
import axios from 'axios';
import { ethers } from 'ethers';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const query = new URLSearchParams();
  query.append('chain', '0x13881');
  query.append('media_items', 'false');
  query.append('format', 'decimal');
  const contracts = await Contract.find({}).populate(['lock']);
  contracts.forEach((c) => {
    query.append('token_addresses', c.address);
  });

  console.log(
    `https://deep-index.moralis.io/api/v2/${req.user.wallet}/nft?${query}`
  );
  let nfts = [];
  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/${req.user.wallet}/nft?${query}`,
      {
        headers: {
          'X-API-Key': process.env.MORALIS_API_KEY,
          Accept: 'application/json',
        },
      }
    );
    nfts = response.data.result.map((r: any) => {
      return {
        ...r,
        contract: contracts.find(
          (c) =>
            ethers.utils.getAddress(c.address) ===
            ethers.utils.getAddress(r.token_address)
        ),
      };
    });
  } catch (e) {}
  //   const response = await Moralis.EvmApi.nft.getWalletNFTs({
  //     chain: '0x13881',
  //     format: 'decimal',
  //     tokenAddresses: contracts.map((c) => c.address),
  //     mediaItems: false,
  //     address: req.user.wallet,
  //   });
  res.status(200).json({ nfts: nfts });
}

export default withAuth(handler);
