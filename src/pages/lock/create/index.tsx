import { Inter } from 'next/font/google';
import { useState } from 'react';
import Input from '@/components/Input';

import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Select from '@/components/Select';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { LockHelper } from '@/lib/locks/locks';

const inter = Inter({ subsets: ['latin'] });

interface LockFormData {
  name: string;
  type: ELock;
  apiKey: string;
  userId: string;
  metadata: any;
}
export enum ELock {
  nuki = 'Nuki',
  random = 'RandomLock',
}

export default function Home({ user }: any) {
  const router = useRouter();
  const [locks, setLocks] = useState<any[]>([]);
  const [formData, setFormData] = useState<LockFormData>({
    name: '',
    type: ELock.nuki,
    apiKey: '',
    userId: user?._id,
    metadata: null,
  });

  const getLocks = async () => {
    const lockHelper = new LockHelper(formData.type, formData.apiKey);
    if (lockHelper.lock) {
      const locks = await lockHelper.lock.getLocks();
      setLocks([...locks]);
      console.log(locks, 'locks');
    }
  };

  const onSubmit = async () => {
    try {
      await api.createLock(formData);
      toast.success('Successfully created lock!');
      router.push('/lock');
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
      className={`max-w-[1440px] min-h-screen m-auto flex justify-center ${inter.className} px-2 md:px-0`}
    >
      <div className="max-w-[600px] m-auto w-full flex flex-col mt-10 text-orange-500">
        <h1 className=" text-2xl text-orange-500 mb-6">Create Lock</h1>

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
            onClick={getLocks}
            className="text-white bg-orange-500 hover:opacity-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Get Locks
          </button>
          <div className="flex flex-wrap">
            {locks.map((l) => {
              return (
                <div
                  className={`w-[200px] rounded-md border border-orange-500 px-3 py-2 text-center text-sm font-semibold text-black hover:text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer
                  ${formData.metadata && 'border-green-700'}
                  `}
                  key={l.id}
                  onClick={() => {
                    setFormData({ ...formData, metadata: l });
                    toast.success('Successfully set metadata');
                  }}
                >
                  {l.name}
                </div>
              );
            })}
          </div>

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

export async function getServerSideProps({ req }: any) {
  const auth = req?.cookies?.['auth'];
  api.updateHeaders('Authorization', auth);
  let user = {};
  if (auth) {
    user = await api.me();
  }

  return {
    props: { user },
  };
}
