import { Inter } from 'next/font/google';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { UserDocument } from '@/lib/db/user';
import { getProvider } from '@/components/ConnectModal';
import Router from 'next/router';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Helper } from '@/helpers/helper';
import { toast } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

const fetchLockAction = async (nfts: any) => {
  // const { data } = await api.lockAction(contract);
  // console.log(data, 'actionn');

  // return data.lockAction;
  for (const nft of nfts) {
    const lockAction = await api.lockAction(nft.contract);
    Object.assign(nft, { ...nft, lockAction });
    // return data.lockAction;
  }
};

export default function Home({
  user,
  nfts,
}: {
  user: UserDocument;
  nfts: any[];
}) {
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState('');
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
  const [unlockDisable, setUnlockDisable] = useState(false);

  const unlock = async (nft: any) => {
    setUnlockDisable(true);
    const message = `I want to unlock ${nft.contract.metadata.name}\nCollection:\n${nft.token_address}\n\nToken:\n${nft.token_id}
    `;
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      await api.unlock({ signature, message });

      toast.success(nft.lockAction?.lockAction);
      await fetchLockAction(nfts);

      setTimeout(() => {
        Router.reload();
      }, 5000);
    } catch (e) {
      console.log('ovaj', e);
      setError(JSON.stringify(e));
      toast.error('Someting went wrong!');
      //
    }
  };

  useEffect(() => {}, []);

  return (
    <main className={`px-6 pt-6 ${inter.className}`}>
      <div className="sm:flex sm:items-start border-b border-gray-100 pb-4">
        <div className="sm:flex-auto">
          <h1 className="text-[25px] font-semibold leading-6 text-gray-900">
            NFT Keys
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Easily open all doors with nft. List of all keys
          </p>
        </div>
      </div>
      {nfts.length > 0 && (
        <div className="px-2 mt-5">
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
                    <p className="text-sm font-medium">
                      {nft.contract.lock?.name}
                    </p>
                    <button
                      disabled={unlockDisable}
                      className="bg-orange-500 rounded-lg p-1 min-w-[150px] min-h-[50px] hover:bg-orange-400 text-white mt-2"
                      onClick={() => unlock(nft)}
                    >
                      {unlockDisable
                        ? 'Loading...'
                        : nft.lockAction?.lockAction}
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
    console.log(nftsRes.nfts, 'nftsss');

    nfts = nftsRes.nfts;
    await fetchLockAction(nfts);
  } catch (e) {
    //
  }

  return {
    props: { nfts },
  };
}
