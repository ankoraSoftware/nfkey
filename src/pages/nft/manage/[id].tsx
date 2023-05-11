import Input from '@/components/Input';
import { getProvider } from '@/components/Web3Modal';
import { ContractHelper } from '@/helpers/contract';
import { Helper } from '@/helpers/helper';
import { api } from '@/lib/api';
import { ContractDocument } from '@/lib/db/contract';

import 'react-datepicker/dist/react-datepicker.css';
import { CheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { KeyAccessDocument } from '@/lib/db/key-access';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tabs from '@/components/Tabs';
import Table from '@/components/table';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

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

const ManageNft = ({
  contract,
  keyAccesses,
}: {
  contract: IContract;
  keyAccesses: KeyAccessDocument[];
}) => {
  console.log(keyAccesses, 'ads');
  const router = useRouter();
  const [nft, setNft] = useState<NftValue>({
    from: null,
    to: null,
    tokenUri: '',
    signature: '',
  });

  const [address, setAddress] = useState('');
  const [link, setLink] = useState('');
  const [unlimitedAccess, setUnlimitedAccess] = useState(false);

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

    const { keyAccess } = await api.createKeyAccess({
      contract: contract._id,
      signature,
      startTime: key.startTime,
      endTime: key.endTime,
      tokenUri: key.tokenUri,
    });

    return {
      key: [key.tokenUri, key.startTime, key.endTime],
      signature,
      keyAccess,
    };
  };

  const drop = async () => {
    try {
      const { key, signature } = await createMetadataAndSignature();
      const web3Contract = await ContractHelper.init(contract.address);
      const tx = await web3Contract.mint(key, address, signature);
      await api.updateKeyAccess({ signature, owner: address });
      await tx.wait();

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
      const { keyAccess } = await createMetadataAndSignature();
      setLink(`${window.origin}/claim/${keyAccess._id}`);
      setAddress('');
      setNft({
        from: null,
        to: null,
        tokenUri: '',
        signature: '',
      });

      toast.success('Successfully generated link');
    } catch (e) {
      console.log('e', e);

      toast.error('Something went wrong');
    }
  };

  const keyAccessData = keyAccesses.map((item: any) => {
    return {
      owner: Helper.shortenAddress(item?.owner) || 'No owner',
      startTime: item?.startTime
        ? format(new Date(item?.startTime), 'MM/dd/yyyy')
        : 'Life time access',
      endTime: item?.endTime
        ? format(new Date(item?.endTime), 'MM/dd/yyyy')
        : 'Life time access',
      userId: Helper.shortenAddress(item?.user),
    };
  });

  // TABS
  const TABS = [
    {
      id: 'sendNft',
      name: 'Send NFT',
      component: (
        <div className="px-4 md:px-0 md:pr-2 pb-10 mt-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <Image
              className="rounded-md w-[256px] h-[256px] object-cover self-center md:self-start"
              width={256}
              height={256}
              src={contract.metadata.image.replace(
                'ipfs://',
                'https://ipfs.io/ipfs/'
              )}
              alt="image"
            />
            <div className="flex flex-col max-w-[600px]">
              <h1 className="text-orange-500 text-xl  mb-1">
                {contract.metadata.name}
              </h1>
              <div className="flex  items-center gap-4 mb-2">
                <h2 className=" text-gray-600 hover:text-orange-500 cursor-pointer">
                  <a target="_blank" href={contract.metadata.external_link}>
                    {`${contract.metadata.external_link.substring(0, 8)}...`}
                  </a>
                </h2>{' '}
                | <h2 className=" text-orange-500">{contract.metadata.lock}</h2>{' '}
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

          <div className="w-full mt-4 ">
            <h2 className="text-orange-500 font-bold text-[22px]">Drop NFT</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 mt-5">
                <div className="w-full">
                  <label className="block text-sm font-medium text-orange-500">
                    Date from
                  </label>
                  <DatePicker
                    disabled={unlimitedAccess}
                    placeholderText={unlimitedAccess ? 'Today' : '05/26/2024'}
                    className="min-w-[100px] bg-white border border-gray-300 text-gray-900 hover:border-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:pointer-events-none"
                    selected={nft.from}
                    onChange={(date) => setNft({ ...nft, from: date })}
                  />
                </div>

                <p className="hidden md:flex text-orange-500 md:mt-3 font-xxl">
                  -
                </p>

                <div className="w-full">
                  <label className="block text-sm font-medium text-orange-500">
                    Date to
                  </label>
                  <DatePicker
                    disabled={unlimitedAccess}
                    placeholderText={
                      unlimitedAccess ? 'Unlimited' : '06/17/2024'
                    }
                    className="min-w-[100px] bg-white border border-gray-300 text-gray-900 hover:border-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:pointer-events-none"
                    selected={nft.to}
                    onChange={(date) => setNft({ ...nft, to: date })}
                  />
                </div>

                <p className="text-orange-500 md:mt-3 font-xxl leading-none self-start md:self-center">
                  or
                </p>

                <div className="flex items-center md:pl-2 h-full min-h-[40px] md:mt-4 w-full min-w-[300px]">
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
                  <p className="text-sm"> or Check for unlimited access</p>
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
      ),
    },
    {
      id: 'nftDetails',
      name: "NFT's Details",
      component: (
        <div className="w-full px-4 md:px-0 md:pr-2">
          <Table
            isExpandable={false}
            data={keyAccessData}
            columns={[
              { title: 'Owner', key: 'owner' },
              { title: 'Start Time', key: 'startTime' },
              { title: 'End Time', key: 'endTime' },
              { title: 'User Id', key: 'userId' },
            ]}
          />
        </div>
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  return (
    <div className="flex items-start flex-col justify-center gap-2 w-full max-w-[900px] ml-2 md:ml-14">
      <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-full">
        {TABS.map((tab, i) => {
          if (tab.name === activeTab) return <div key={i}>{tab.component}</div>;
        })}
      </div>
    </div>
  );
};

export default ManageNft;

export async function getServerSideProps(context: any) {
  const contractId = context.params.id;
  let contract;
  let keyAccesses = [];
  try {
    const contractRes = await api.getContract(contractId);
    contract = contractRes.contract;
    const keyAccessesRes = await api.getKeyAccesses(contractId);
    keyAccesses = keyAccessesRes.keyAccesses;
  } catch (e) {}

  return {
    props: { contract, keyAccesses },
  };
}
