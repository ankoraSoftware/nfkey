import Table from "@/components/Table";
import { NFT_COLUMNS } from "@/constants/nfts";
import { api } from "@/lib/api";
import React, { useState } from "react";

type Props = {
  nfts: any;
};

const NFT: React.FC<Props> = ({ nfts }) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]); // State variable to track expanded rows
  console.log("expamda", nfts);

  const rowsUI = (data: any) => {
    // Function to toggle the expanded state of a row
    const toggleRow = (rowId: any) => {
      if (expandedRows.includes(rowId)) {
        setExpandedRows(expandedRows.filter((id) => id !== rowId));
      } else {
        setExpandedRows([...expandedRows, rowId]);
      }
    };

    return (
      <div className="w-full">
        {data.map((d: any) => (
          <>
            <div key={d._id} className="flex py-2 border-b border-b-gray-400">
              <p className="text-sm text-gray-600 min-w-[200px] flex items-center">
                {d.user}
              </p>
              <p className="text-sm text-gray-600 min-w-[200px] flex items-center">
                {d.metadata.name}
              </p>
              <p className="text-sm text-gray-600 min-w-[150px] flex items-center line-clamp-3">
                {d.metadata.description}
              </p>
              <button
                onClick={() => toggleRow(d._id)}
                className="ml-auto focus:outline-none w-full"
              >
                {expandedRows.includes(d._id) ? "-" : "+"}
              </button>
            </div>
            {expandedRows.includes(d._id) && (
              <div className="flex flex-col py-2 border-b border-b-gray-200">
                <p className="text-sm font-medium text-orange-500">
                  Detailed description:{" "}
                </p>
                <p className="text-sm text-gray-600 min-w-[150px] flex items-center">
                  {d.metadata.description}
                </p>
              </div>
            )}
          </>
        ))}
      </div>
    );
  };
  return (
    <div className="max-w-[1440px] min-h-screen m-auto bg-gray-100 flex justify-center">
      <div className="flex flex-col max-w-[600px] mt-10">
        <p className="text-sm text-gray-600">List of all NFTs</p>
        <Table columns={NFT_COLUMNS} rowData={nfts.nft} mapRowsUI={rowsUI} />
      </div>
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
