import { ethers } from 'ethers';
import { ABI } from './abi';
import axios from 'axios';
import { getProvider } from '@/components/ConnectModal';

export class ContractHelper {
  public static async init(address: string) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const { data: artifact } = await axios.get(
      `https://ipfs.io/ipfs/${process.env.NEXT_PUBLIC_SMART_CONTRACT_ARTIFACT}`
    );

    const abi = artifact['abi'];
    const contract = new ethers.Contract(address, abi, signer);
    return contract;
  }
}
