import { api } from "@/lib/api";
import Router, { useRouter } from "next/router";
import React, { useState } from "react";
import Table from "@/components/table";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type Props = {
  nfts: any;
};

const NFT: React.FC<Props> = ({ nfts }) => {
  const router = useRouter();

  const deleteNft = async (id: any) => {
    try {
      await api.deleteNft(id as string);
      toast.success("Successfully deleted nft!");
      router.push("/nft");
    } catch (error: any) {
      toast.error(`Error: ${error.message.substring(0, 25)}`);
    }
  };

  const parseData = (nfts?.nft || []).map((item: any) => {
    return {
      name: item.metadata.name.trim(),
      user: item.user,
      description: item.metadata.description,
      image: item.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
      actions: [
        {
          name: "Manage",
          icon: (
            <PencilSquareIcon className="cursor-pointer text-gray-500 w-5 h-5 hover:opacity-75" />
          ),
          action: () => router.push(`/nft/manage/${item._id}`),
        },
        {
          name: "Delete",
          icon: (
            <TrashIcon className="cursor-pointer text-red-500 w-5 h-5 hover:opacity-75" />
          ),
          action: () => deleteNft(item._id),
        },
      ],
    };
  });
  return (
    <div className="px-6 pt-6">
      <div className="sm:flex sm:items-start border-b border-gray-100 pb-4">
        <div className="sm:flex-auto">
          <h1 className="text-[25px] font-semibold leading-6 text-gray-900">
            NFTs
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Easily view, manage, and monitor the all NFTs
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => router.push("/create-nft")}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add new NFT
          </button>
        </div>
      </div>
      <Table
        data={parseData}
        columns={[
          { title: "Name", key: "name" },
          { title: "User", key: "user" },
        ]}
      />
    </div>
  );
};

export default NFT;

export async function getServerSideProps({ req }: any) {
  const auth = req?.cookies?.["auth"];
  api.updateHeaders("Authorization", auth);
  let nfts = {};
  if (auth) {
    nfts = await api.getNfts();
  }

  return {
    props: { nfts },
  };
}
