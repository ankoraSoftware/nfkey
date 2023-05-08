import React from 'react';
import { api } from '@/lib/api';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Router, { useRouter } from 'next/router';
import Table from '@/components/table';

const Locks = ({ locks }: any) => {
  const router = useRouter();

  const deleteLock = async (id: any) => {
    await api.deleteLock(id as string);

    Router.reload();
  };

  const parseData = locks.map((item: any) => {
    return {
      name: item.name.trim(),
      type: item.type,
      actions: [
        {
          name: 'Edit',
          icon: (
            <PencilSquareIcon className="cursor-pointer text-gray-500 w-5 h-5 hover:opacity-75" />
          ),
          action: () => router.push(`/lock/edit/${item._id}`),
        },
        {
          name: 'Delete',
          icon: (
            <TrashIcon className="cursor-pointer text-red-500 w-5 h-5 hover:opacity-75" />
          ),
          action: () => deleteLock(item._id),
        },
      ],
    };
  });

  return (
    <div className="px-6 pt-6">
      <div className="sm:flex sm:items-start border-b border-gray-100 pb-4">
        <div className="sm:flex-auto">
          <h1 className="text-[25px] font-semibold leading-6 text-gray-900">
            Locks
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Easily view, manage, and monitor the status of all locks in one
            location for enhanced security and convenience
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => router.push('/lock/create')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add new lock
          </button>
        </div>
      </div>
      <Table
        data={parseData}
        columns={[
          { title: 'Name', key: 'name' },
          { title: 'Type', key: 'type' },
        ]}
      />
    </div>
  );
};

export async function getServerSideProps({ req }: any) {
  const auth = req?.cookies?.['auth'];
  api.updateHeaders('Authorization', auth);
  let locks = {};
  if (auth) {
    locks = await api.getLocks();
  }

  return {
    props: { locks },
  };
}

export default Locks;
