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
  };

  const test = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const { data } = await axios.get("/api/auth/nonce");
    const signature = await signer.signMessage(data.message);
    await axios.post("/api/auth/signin", { signature, message: data.message });
  };

  return (
    <main className={` ${inter.className}`}>
      <button onClick={handleClick}>connect wallet</button>
      <p>Connected Address: {address}</p>

      <button onClick={test}>test</button>
      <p>{user?.wallet}</p>
    </main>
  );
}
