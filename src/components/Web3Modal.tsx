import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BscConnector } from '@binance-chain/bsc-connector';
import { ethers } from 'ethers';

const PROVIDER_STORAGE_KEY = 'walletProvider';

export const getWeb3Modal = (): Web3Modal => {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: 'https://bsc-dataseed.binance.org/',
          97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        },
        networkId: 56,
      },
    },
    bsc: {
      package: BscConnector,
      options: {
        supportedChainIds: [56, 97],
      },
    },
  };

  const cachedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY);
  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: cachedProvider !== null,
    providerOptions,
  });

  // If there is a cached provider, restore it
  if (cachedProvider !== null) {
    web3Modal.setCachedProvider(cachedProvider);
  }

  return web3Modal;
};

export const getProvider = async (): Promise<ethers.providers.Web3Provider> => {
  const web3Modal = getWeb3Modal();
  const provider = await web3Modal.connect();
  const ethersProvider = new ethers.providers.Web3Provider(provider);

  // Store the provider in local storage so it can be restored on page reload
  localStorage.setItem(PROVIDER_STORAGE_KEY, web3Modal.cachedProvider);

  return ethersProvider;
};
