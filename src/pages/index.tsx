import { Inter } from 'next/font/google';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { UserDocument } from '@/lib/db/user';
import { getProvider } from '@/components/Web3Modal';
import Router from 'next/router';
import { api } from '@/lib/api';

const inter = Inter({ subsets: ['latin'] });

export default function Home({
  user,
  nfts,
}: {
  user: UserDocument;
  nfts: any[];
}) {
  const [address, setAddress] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedProvider = localStorage.getItem('account') ?? '';
      setAddress(cachedProvider);
    }
  }, []);

  const handleClick = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const connectedAddress = await signer.getAddress();
    setAddress(connectedAddress);
    const { data } = await axios.get('/api/auth/nonce');
    const signature = await signer.signMessage(data.message);
    await axios.post('/api/auth/signin', { signature, message: data.message });
    Router.reload();
  };

  const unlock = async (nft: any) => {
    const message = `I want to unlock ${nft.contract.metadata.name}\nCollection:\n${nft.token_address}\n\nToken:\n${nft.token_id}
    `;

    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    await api.unlock({ signature, message });
  };

  return (
    <main className={` ${inter.className}`}>
      {user ? (
        <p className="text-gray-600">Connected Address: {user?.wallet}</p>
      ) : (
        <button
          className="bg-orange-500 rounded-lg p-1 min-w-[100px] min-h-[50px] hover:bg-orange-400 text-white"
          onClick={handleClick}
        >
          Connect wallet
        </button>
      )}
      {nfts.length > 0 && (
        <div>
          <p>Your keys</p>
          {nfts.map((nft) => {
            return (
              <div key={nft.token_hash}>
                <p> Name: {nft.contract?.metadata?.name}</p>
                <button onClick={() => unlock(nft)}>Unlock</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export async function getServerSideProps({ req }: any) {
  let nfts = [];
  try {
    const nftsRes = await api.getWalletNfts();
    nfts = nftsRes.nfts;
  } catch (e) {}

  return {
    props: { nfts },
  };
}
