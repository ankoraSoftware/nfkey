import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserDocument } from '@/lib/db/user';
import { getProvider } from '@/components/Web3Modal';
import Router from 'next/router';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Helper } from '@/helpers/helper';

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
        <div className="px-2 mt-5">
          <p className="font-semibold text-xl border-b border-gray-300 pb-2 mb-2 ">
            Your keys
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
            {nfts.map((nft) => {
              return (
                <div
                  key={nft.token_hash}
                  className="flex flex-col items-center w-[280px] bg-gray-100 rounded-md overflow-hidden"
                >
                  <Image
                    width={500}
                    height={500}
                    quality={100}
                    src={nft.contract.metadata.image.replace(
                      'ipfs://',
                      'https://ipfs.io/ipfs/'
                    )}
                    alt="Img"
                    className="w-[90%] h-[250px] mt-3 rounded-md object-cover"
                  />
                  <div className="w-full lex flex-col justify-start p-4">
                    <p className="text-base font-medium">
                      {nft.contract?.metadata?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {nft.contract.metadata.lock.substring(0, 15)}
                    </p>
                    <button
                      className="bg-orange-500 rounded-lg p-1 min-w-[150px] min-h-[50px] hover:bg-orange-400 text-white mt-2"
                      onClick={() => unlock(nft)}
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
