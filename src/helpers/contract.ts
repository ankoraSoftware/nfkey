import { ethers } from 'ethers';
import { ABI } from './abi';
import { getProvider } from '@/components/Web3modal';

export class ContractHelper {
  public static async init() {
    const provider = await getProvider();
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFKEY_CONTRACT_ADDRESS as string,
      ABI,
      signer
    );
    return contract;
  }
}
