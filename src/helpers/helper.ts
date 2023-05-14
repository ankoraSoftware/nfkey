import axios from 'axios';
import { toast } from 'react-hot-toast';
import { enc, MD5 } from 'crypto-js';

export class Helper {
  private static endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  private static infura_endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  private static headers(restHeaders = {}) {
    return {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_IPFS_API_KEY}:${process.env.NEXT_PUBLIC_IPFS_SECRET_KEY}`
      ).toString('base64')}`,
      ...restHeaders,
    };
  }

  public static async uploadJsonToIpfs(jsonData: unknown) {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
    );
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers(),
      body: formData,
    });
    const result = await response.json();
    return result.Hash;
  }

  public static walletTruncate = (wallet: string) => {
    const walletSub = `${wallet?.substring(0, 4)}...
   ${wallet?.substring(wallet?.length - 4, wallet?.length)}`;
    return walletSub;
  };

  public static validateWalletAddress = (walletAddress: string) => {
    const regex = /^(0x)?[0-9a-fA-F]{40}$/i;
    return regex.test(walletAddress);
  };

  public static copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Successfully copied to clipboard');
      })
      .catch((error) => {
        toast.error('Something went wrong');
      });
  };

  public static generateGravatar(walletAddress: string) {
    const email = walletAddress.toLowerCase();
    const gravatarHash = MD5(email).toString(enc.Hex);
    const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}`;
    return gravatarUrl;
  }

  public static shortenAddress(address: string, length = 4) {
    if (!address) return null;
    return `${address?.substring(0, length)}...${address?.substring(
      address?.length - length
    )}`;
  }

  public static uploadFileToInfura = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(this.infura_endpoint, formData, {
        headers: this.headers({ 'Content-Type': 'multipart/form-data' }),
      });

      return response.data.Hash;
    } catch (error) {
      console.error('Error uploading file to Infura:', error);
    }
  };
}
