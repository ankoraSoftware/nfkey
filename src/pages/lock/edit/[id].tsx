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
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Select from '@/components/Select';
import { api } from '@/lib/api';

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

export default function EditLock({ lock }: any) {
  const [formData, setFormData] = useState<LockFormData>({
    name: lock.name,
    type: lock.type,
    apiKey: lock.apiKey,
  });

  const onSubmit = async () => {
    try {
      await api.updateLock(lock._id, formData);
      alert('Successfully updated lock');
      router.push('/lock');
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

  return (
    <main
      className={`max-w-[1440px] min-h-screen  m-auto bg-gray-100 flex  justify-center ${inter.className}`}
    >
      <div className="max-w-[600px] m-auto w-full flex flex-col mt-10">
        <h1 className="text-gray-900 text-2xl mb-2">Edit Lock</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="John Doe lock..."
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-900">
              Choose lock type
            </label>
            <Select
              options={Object.values(ELock).map((type) => ({
                id: type,
                value: type,
              }))}
              value={formData.type}
              containerStyle="bg-gray-800 border rounded-md border-gray-600 hover:border-gray-500 w-full max-w-[150px] lg:min-w-[135px]"
              selectStyle=""
              listStyle="text-sm bg-gray-800 border border-gray-600 rounded-md"
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
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
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
