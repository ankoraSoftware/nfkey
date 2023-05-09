import React from "react";
import { api } from "@/lib/api";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Router, { useRouter } from "next/router";

const Locks = ({ locks }: any) => {
  const router = useRouter();
  return (
    <div className="text-gray-900">
      <button
        className="p-2 bg-orange-500 rounded-lg mr-2 hover:bg-orange-300 mb-2"
        onClick={() => router.push("/lock/create")}
      >
        CREATE LOCK
      </button>
      <div>Locks:</div>
      <table className="border border-gray-800">
        <tbody>
          {locks?.map((lock: any) => (
            <tr
              key={lock._id}
              className="flex items-center gap-2 border-b border-gray-900 last:border-none"
            >
              <td className="min-w-[100px]">{lock.name.substring(0, 30)}</td>
              <td className="min-w-[100px]">{lock.type.substring(0, 30)}</td>
              <td className="flex gap-2 min-w-[100px]">
                <TrashIcon
                  className="cursor-pointer text-red-500 w-4 h-4"
                  onClick={async () => {
                    await api.deleteLock(lock._id as string);
                    alert("Successfully deleted lock");
                    Router.reload();
                  }}
                />
                <PencilSquareIcon
                  className="cursor-pointer text-orange-500 w-4 h-4"
                  onClick={() => router.push(`/lock/edit/${lock._id}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export async function getServerSideProps({ req }: any) {
  const auth = req?.cookies?.["auth"];
  api.updateHeaders("Authorization", auth);
  let locks = [];
  if (auth) {
    locks = await api.getLocks();
  }

  return {
    props: { locks },
  };
}

export default Locks;
