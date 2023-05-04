import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { getProvider } from '@/components/Web3modal';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
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
  };

  const test = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const signature = await signer.signMessage('bla');
    console.log('signature', signature);
  };

  return (
    <main className={` ${inter.className}`}>
      <button onClick={handleClick}>connect wallet</button>
      <p>Connected Address: {address}</p>

      <button onClick={test}>test</button>
    </main>
  );
}
