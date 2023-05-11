import Select from '@/components/Select';
import { LockDocument } from '@/lib/db/lock';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import { Inter } from 'next/font/google';
import FileUpload from '@/components/FileUpload';
import { useState } from 'react';
import Input from '@/components/Input';
import TextArea from '@/components/Textarea';
import axios from 'axios';
import { Helper } from '@/helpers/helper';
import router from 'next/router';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { getProvider } from '@/components/Web3Modal';

const inter = Inter({ subsets: ['latin'] });

interface NftFormData {
  name: string;
  externalLink: string;
  description: string;
  file: File | null;
  supply: number;
  lockId: string | null;
}

export default function CreateNFT({ locks }: { locks: LockDocument[] }) {
  const [disabledButton, setDisabledButton] = useState(false);
  const [formData, setFormData] = useState<NftFormData>({
    name: '',
    externalLink: '',
    description: '',
    file: null,
    supply: 0,
    lockId: null,
  });

  const handleFileUpload = async (file: File | null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      file: file,
    }));
  };

  const onSubmit = async () => {
    setDisabledButton(true);

    try {
      const imageHash = await Helper.uploadFileToInfura(formData.file as File);
      const metadata = {
        image: `ipfs://${imageHash}`,
        name: formData.name,
        description: formData.description,
        external_link: formData.externalLink,
      };
      const hash = await Helper.uploadJsonToIpfs(metadata);
      const { data: artifact } = await axios.get(
        `https://ipfs.io/ipfs/${process.env.NEXT_PUBLIC_SMART_CONTRACT_ARTIFACT}`
      );
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const abi = artifact['abi'];
      const bytecode = artifact['evm']['bytecode']['object'];
      const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = await contractFactory.deploy(formData.name, '', hash);
      await contract.deployTransaction.wait();
      await api.createContract({
        metadata,
        address: ethers.utils.getAddress(contract.address),
        chainId: provider.network.chainId,
        lock: formData.lockId,
      });
      toast.success('Successfully created nft!');
      router.push('/nft');
    } catch (error: any) {
      toast.error(`Error: ${error.message.substring(0, 25)}`);
    }
    setDisabledButton(false);
  };
  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  console.log('formData', formData);
  return (
    <main
      className={`max-w-[1440px] w-full min-h-screen m-auto flex pb-4 justify-center ${inter.className} px-2 md:px-0`}
    >
      <div className="max-w-[600px] m-auto w-full flex flex-col mt-10 text-orange-500 ">
        <h1 className=" text-2xl  text-orange-500 mb-6">Create NFT</h1>

        <div className="flex flex-col gap-6">
          <div className="mb-4">
            <FileUpload label="Select a file" onChange={handleFileUpload} />
          </div>

          <div>
            <Input
              label="Name"
              placeholder="John Doe nft.."
              name="name"
              value={formData.name}
              onChange={handleFormChange}
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium">Choose lock</label>
            <Select
              options={locks.map((lock) => ({
                id: lock._id,
                value: lock.name,
              }))}
              value={formData.lockId}
              containerStyle="bg-white border rounded-md border-gray-300 hover:border-gray-500 w-full]"
              selectStyle=""
              listStyle="text-sm bg-white border border-gray-300 rounded-md"
              setValue={(value) => setFormData({ ...formData, lockId: value })}
              icon={<ChevronDownIcon className="w-4 h-4" />}
            />
          </div>

          <div>
            <Input
              label="Supply"
              placeholder="1"
              name="supply"
              type="number"
              value={formData.supply}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <Input
              label="External link"
              placeholder="https://www.example.com"
              name="externalLink"
              value={formData.externalLink}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <TextArea
              label="Description"
              placeholder="Lorem ipsum dolor set amet.."
              name="description"
              value={formData.description}
              onChange={handleFormChange}
            />
          </div>

          <button
            disabled={disabledButton}
            onClick={onSubmit}
            className="text-white bg-orange-500 hover:opacity-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {disabledButton ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps({ req }: any) {
  let locks = [];
  try {
    locks = await api.getLocks();
  } catch (e) {}

  return {
    props: { locks },
  };
}
