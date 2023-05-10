import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { getProvider } from "@/components/Web3modal";
import axios from "axios";
import { UserDocument } from "@/lib/db/user";

const inter = Inter({ subsets: ["latin"] });

export default function Home({ user }: { user: UserDocument }) {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedProvider = localStorage.getItem("account") ?? "";
      setAddress(cachedProvider);
    }
  }, []);

  const handleClick = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const connectedAddress = await signer.getAddress();
    setAddress(connectedAddress);
    const { data } = await axios.get("/api/auth/nonce");
    const signature = await signer.signMessage(data.message);
    await axios.post("/api/auth/signin", { signature, message: data.message });
  };

  return (
    <main className={` ${inter.className}`}>
      {user ? (
        <p className="text-gray-600">Connected Address: {user?.wallet}</p>
      ) : (
        <button
          className="bg-orange-500 rounded-lg p-2 min-w-[100px] min-h-[50px] hover:bg-orange-400 text-white"
          onClick={handleClick}
        >
          Connect wallet
        </button>
      )}
    </main>
  );
}
