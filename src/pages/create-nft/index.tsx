import Image from 'next/image';
import { Inter } from 'next/font/google';
import FileUpload from '@/components/FileUpload';
import { useState } from 'react';
import Input from '@/components/Input';
import TextArea from '@/components/Textarea';
import axios from 'axios';
import { Helper } from '@/helpers/helper';
import router from 'next/router';
import { ContractHelper } from '@/helpers/contract';
import { api } from '@/lib/api';

const inter = Inter({ subsets: ['latin'] });

interface NftFormData {
  name: string;
  externalLink: string;
  description: string;
  file: File | null;
  supply: number;
}

//TO-DO: STAVITI BRAVE DROPDOWN

export default function Home() {
  const [formData, setFormData] = useState<NftFormData>({
    name: '',
    externalLink: '',
    description: '',
    file: null,
    supply: 0,
  });

  const handleFileUpload = async (file: File) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      file: file,
    }));
  };

  const onSubmit = async () => {
    try {
      const imageHash = await Helper.uploadFileToInfura(formData.file as File);
      const metadata = {
        image: `ipfs://${imageHash}`,
        name: formData.name,
        description: formData.description,
        external_link: formData.externalLink,
      };
      const hash = await Helper.uploadJsonToIpfs(metadata);
      const contract = await ContractHelper.init();
      const tx = await contract.createToken(formData.supply, hash);
      const nft = await api.createNft(metadata);
      await tx.wait();
      //   router.push('/');
      alert('finito' + JSON.stringify(nft));
    } catch (error) {
      console.error(error);
      // Handle the error here
    }
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
      className={`max-w-[1440px] min-h-screen  m-auto bg-gray-100 flex pb-4 justify-center ${inter.className}`}
    >
      <div className="max-w-[600px] m-auto w-full flex flex-col mt-10 text-orange-500 ">
        <h1 className="mb-10">Create nft</h1>

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
            onClick={onSubmit}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  );
}
