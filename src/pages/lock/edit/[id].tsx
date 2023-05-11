import { Inter } from 'next/font/google';
import { useState } from 'react';
import Input from '@/components/Input';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Select from '@/components/Select';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import CryptoJS from 'crypto-js';

const inter = Inter({ subsets: ['latin'] });

interface LockFormData {
  name: string;
  type: string;
  apiKey: string;
}
export enum ELock {
  nuki = 'Nuki',
  random = 'RandomLock',
}

const secretKey = 'SecretKey245';
const decryptMessage = (text: string) => {
  return CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);
};

export default function EditLock({ lock }: any) {
  const [formData, setFormData] = useState<LockFormData>({
    name: lock?.name,
    type: lock?.type,
    apiKey: decryptMessage(lock?.apiKey),
  });

  const onSubmit = async () => {
    try {
      await api.updateLock(lock._id, formData);
      toast.success('Successfully updated lock!');
    } catch (error: any) {
      toast.error(`Error: ${error.message.substring(0, 25)}`);
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

  return (
    <main
      className={`max-w-[1440px] min-h-screen  m-auto bg-gray-100 flex  justify-center ${inter.className}`}
    >
      <div className="max-w-[600px] m-auto w-full flex flex-col mt-10 text-orange-500">
        <h1 className=" text-2xl mb-2 text-orange-500 mb-6">Edit lock</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="John Doe lock..."
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />
          <div className="w-full">
            <label className="block text-sm font-medium">
              Choose lock type
            </label>
            <Select
              options={Object.values(ELock).map((type) => ({
                id: type,
                value: type,
              }))}
              value={formData.type}
              containerStyle="bg-white border rounded-md border-gray-300 hover:border-gray-500 w-full]"
              selectStyle=""
              listStyle="text-sm bg-white border border-gray-300 rounded-md"
              setValue={(value) => setFormData({ ...formData, type: value })}
              icon={<ChevronDownIcon className="w-4 h-4" />}
            />
          </div>
          <Input
            label="Api Key"
            placeholder="4318y541kfJow..."
            name="apiKey"
            value={formData.apiKey}
            onChange={handleFormChange}
          />

          <button
            onClick={onSubmit}
            className="text-white bg-orange-500 hover:opacity-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const lockId = context.params.id;
  const lock = await api.getLock(lockId);

  return {
    props: { lock },
  };
}
