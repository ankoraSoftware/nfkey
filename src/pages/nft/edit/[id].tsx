import { Inter } from "next/font/google";
import { useState } from "react";
import Input from "@/components/Input";
import router from "next/router";
import { api } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

interface NFTFormData {
  name: string;
  description: string;
  image: string;
}

export default function EditNFT({ nft }: any) {
  console.log("NFTTTT", nft, nft.nft.metadata.name);
  const [formData, setFormData] = useState<NFTFormData>({
    name: nft.nft.metadata.name,
    description: nft.nft.metadata.description,
    image: nft.nft.metadata.image,
  });

  const onSubmit = async () => {
    try {
      await api.updateNft(nft.nft._id, { metadata: formData });
      alert("Successfully updated nft");
      router.push("/nft");
    } catch (error) {
      console.error(error);
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
        <h1 className="text-gray-900 text-2xl mb-2">Edit NFT</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Update nft..."
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />

          <Input
            label="Description "
            placeholder="Lorem ipsum ..."
            name="description"
            value={formData.description}
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
  const nftId = context.params.id;
  const nft = await api.getNft(nftId);

  return {
    props: { nft },
  };
}
