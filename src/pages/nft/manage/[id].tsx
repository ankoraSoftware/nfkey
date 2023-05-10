import Input from '@/components/Input';
import { getProvider } from '@/components/Web3Modal';
import { ContractHelper } from '@/helpers/contract';
import { Helper } from '@/helpers/helper';
import { api } from '@/lib/api';
import { ContractDocument } from '@/lib/db/contract';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface NftValue {
  from: null | Date;
  to: null | Date;
  tokenUri: '';
  signature: '';
}

interface IContract extends ContractDocument {
  metadata: {
    image: string;
    name: string;
    external_link: string;
    lock: string;
    description: string;
  };
}

const ManageNft = ({ contract }: { contract: IContract }) => {
  const [nft, setNft] = useState<NftValue>({
    from: null,
    to: null,
    tokenUri: '',
    signature: '',
  });

  const [address, setAddress] = useState('');
  const [link, setLink] = useState('');
  const [unlimitedAccess, setUnlimitedAccess] = useState(false);
  console.log('contract', contract);

  const createMetadataAndSignature = async () => {
    const metadata = contract.metadata;
    const hash = await Helper.uploadJsonToIpfs(metadata);
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const types = {
      Key: [
        { name: 'tokenUri', type: 'string' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
      ],
    };

    const key = {
      tokenUri: `ipfs://${hash}`,
      startTime: unlimitedAccess ? 0 : nft.from?.getTime(),
      endTime: unlimitedAccess ? 0 : nft.to?.getTime(),
    };

    const signature = await signer._signTypedData(
      {
        name: 'NFKey',
        version: '1',
        verifyingContract: contract.address,
        chainId: 80001,
      },
      types,
      key
    );

    return { key: [key.tokenUri, key.startTime, key.endTime], signature };
  };

  const drop = async () => {
    try {
      const { key, signature } = await createMetadataAndSignature();
      const web3Contract = await ContractHelper.init(contract.address);
      await web3Contract.mint(key, address, signature);

      setNft({
        from: null,
        to: null,
        tokenUri: '',
        signature: '',
      });
      setAddress('');

      toast.success('Successfully dropped nft');
    } catch (e) {
      toast.error('Something went wrong');
    }
  };

  const generateLink = async () => {
    try {
      const { key, signature } = await createMetadataAndSignature();
      setLink(`${window.origin}/claim/${signature}`);
      setAddress('');
      setNft({
        from: null,
        to: null,
        tokenUri: '',
        signature: '',
      });

      toast.success('Successfully generated link');
    } catch (e) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex items-start flex-col justify-center gap-2 w-full max-w-[900px] ml-14">
      <div className="flex gap-4 mt-10 ">
        <Image
          className="rounded-[8px] w-[256px] h-[256px] object-cover"
          width={256}
          height={256}
          src={contract.metadata.image.replace(
            'ipfs://',
            'https://ipfs.io/ipfs/'
          )}
          alt="image"
        />
        <div className="flex flex-col max-w-[600px]">
          <h1 className="text-orange-500 text-xl -mt-1 mb-1">
            {contract.metadata.name}
          </h1>
          <div className="flex items-center gap-4 mb-2">
            <h2 className=" text-gray-600 hover:text-orange-500 cursor-pointer">
              <a target="_blank" href={contract.metadata.external_link}>
                {contract.metadata.external_link}
              </a>
            </h2>{' '}
            |{' '}
            <h2 className=" text-orange-500 text-gray-600">
              {contract.metadata.lock}
            </h2>{' '}
            |{' '}
            <h2
              className="text-gray-600 hover:text-orange-500 cursor-pointer"
              onClick={() => Helper.copyToClipboard(contract.address)}
            >
              {Helper.walletTruncate(contract.address)}
            </h2>
          </div>

          <p className="text-gray-500 text-sm">
            {contract.metadata.description}
          </p>
        </div>
      </div>

      <div className=" w-full mt-4 ">
        <h2 className="text-orange-500 font-bold text-[22px]">Drop NFT</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mt-5">
            <div className="w-full">
              <label className="block text-sm font-medium text-orange-500">
                Date from
              </label>
              <DatePicker
                disabled={unlimitedAccess}
                placeholderText={unlimitedAccess ? 'Today' : '05/26/2024'}
                className="bg-gray-50 bg-white border border-gray-300 text-gray-900 hover:border-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:pointer-events-none"
                selected={nft.from}
                onChange={(date) => setNft({ ...nft, from: date })}
              />
            </div>

            <p className="text-orange-500 mt-3 font-xxl">-</p>

            <div className="w-full">
              <label className="block text-sm font-medium text-orange-500">
                Date to
              </label>
              <DatePicker
                disabled={unlimitedAccess}
                placeholderText={unlimitedAccess ? 'Unlimited' : '06/17/2024'}
                className="bg-gray-50 bg-white border border-gray-300 text-gray-900 hover:border-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:pointer-events-none"
                selected={nft.to}
                onChange={(date) => setNft({ ...nft, to: date })}
              />
            </div>

            <p className="text-orange-500 mt-3 font-xxl">or</p>

            <div className="flex items-center pl-2 h-full min-h-[40px] mt-4 flex-1 w-full min-w-[300px]">
              <div
                onClick={() => {
                  setUnlimitedAccess(!unlimitedAccess);
                  setNft({ ...nft, to: null, from: null });
                }}
                style={{
                  border: unlimitedAccess
                    ? '1px solid orange'
                    : '1px solid gray',
                }}
                className="w-5 h-5 bg-gray-100 mr-2 rounded-[3px] flex items-center justify-center cursor-pointer"
              >
                {unlimitedAccess && (
                  <CheckIcon className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm">Check for unlimited access</p>
            </div>
          </div>
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Wallet address"
          />
          <p className="text-[12px] -mt-4 ml-2 text-gray-500">
            Required for Drop! No needed for link generator.
          </p>
          <div className="flex justify-end items-center gap-4">
            <button
              disabled={
                (!unlimitedAccess && (!nft.from || !nft.to)) ||
                !Helper.validateWalletAddress(address)
              }
              className="bg-orange-500 rounded-lg p-1 w-[150px] min-h-[40px] hover:bg-orange-400 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:opacity-100"
              onClick={drop}
            >
              Drop
            </button>

            <p className="text-gray-500">or</p>

            <button
              disabled={!unlimitedAccess && (!nft.from || !nft.to)}
              className="border bg-white text-orange-500 border-orange-500 rounded-lg p-1 w-[150px] min-h-[40px] hover:opacity-75 disabled:border-gray-300 disabled:text-gray-500 disabled:hover:opacity-100"
              onClick={generateLink}
            >
              Get link
            </button>
          </div>

          {link && (
            <div className="w-full flex items-center justify-center mt-10">
              <button
                disabled={!unlimitedAccess && (!nft.from || !nft.to)}
                className="border bg-white text-orange-500 border-orange-500 rounded-lg p-1 w-[350px] min-h-[40px] hover:opacity-75 disabled:border-gray-300 disabled:text-gray-500 disabled:hover:opacity-100"
                onClick={() => Helper.copyToClipboard(link)}
              >
                Claim link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    // <div>
    //   <div className="bg-red-100 p-2 gap-1 flex">
    //     <DatePicker
    //       selected={nft.from}
    //       onChange={(date) => setNft({ ...nft, from: date })}
    //     />
    //     <DatePicker
    //       selected={nft.to}
    //       onChange={(date) => setNft({ ...nft, to: date })}
    //     />
    //   </div>
    //   <div>
    //     <p>Drop NFT</p>
    //     <Input
    //       value={address}
    //       onChange={(e) => setAddress(e.target.value)}
    //       placeholder="Wallet address"
    //     />
    //     <button onClick={drop}>Drop</button>
    //   </div>
    //   <p>Or</p>
    //   <button onClick={generateLink}>Get link</button>
    //   {link && <p>{link.substring(0, 100)}</p>}
    // </div>
  );
};

export default ManageNft;

export async function getServerSideProps(context: any) {
  const contractId = context.params.id;
  let contract;
  try {
    const contractRes = await api.getContract(contractId);
    contract = contractRes.contract;
  } catch (e) {}

  return {
    props: { contract },
  };
}
