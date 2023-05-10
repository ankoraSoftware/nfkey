import { getProvider } from "@/components/Web3Modal";
import { ContractHelper } from "@/helpers/contract";
import { Helper } from "@/helpers/helper";
import { api } from "@/lib/api";
import Contract, { ContractDocument } from "@/lib/db/contract"
import contract from "@/pages/api/contract";
import { ethers } from "ethers";
import { useState } from "react";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';


interface NftValue {
    from: null | Date;
    to: null | Date;
    tokenUri: ''
    signature: ''
}

const ManageNft = ({ contract }: { contract: ContractDocument }) => {

    const [nft, setNft] = useState<NftValue>({from: null, to: null, tokenUri: '', signature: ''})
    const [address, setAddress] = useState("")


    

    const createMetadataAndSignature = async () => {

        console.log(contract.address)
        const metadata = contract.metadata;
       
        const hash = await Helper.uploadJsonToIpfs(metadata);
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const types = {
            Key: [
              { name: 'tokenUri', type: 'string' },
              { name: 'startTime', type: 'uint256' },
              { name: 'endTime', type: 'uint256' },
            ],
          };
      


          const key = {tokenUri: `ipfs://${hash}`, startTime: nft.from?.getTime(), endTime: nft.to?.getTime()}

        const myAccount = await signer.getAddress();
        const typedData = {
            types: {
              EIP712Domain: [
                {
                  name: "name",
                  type: "string"
                },
                {
                  name: "version",
                  type: "string"
                },
                {
                  name: "verifyingContract",
                  type: "address"
                },
                {
                    name: "chainId",
                    type: "uint256"
                  }
              ],
              ...types,
            },
            primaryType: "Key",
            domain: {
              name: "NFKey",
              version: "1",
              verifyingContract: contract.address,
              chainId: 80001,
            },
            message: key
          };
        const signature = await signer.provider.send("eth_signTypedData_v4", [
          myAccount,
          JSON.stringify(typedData)
        ]);

        const a = ethers.utils.verifyTypedData(
            {
                name: "NFKey",
                version: "1",
                verifyingContract: contract.address,
                chainId: 80001,
              },
            types,
            key,
            signature
          );

          console.log(a, 'aaaaaa', myAccount)
         return [key.tokenUri, key.startTime, key.endTime, signature]
    }



    const drop = async() => {
        const key = await createMetadataAndSignature()
        const web3Contract = await ContractHelper.init(contract.address);
        console.log(key)
        await web3Contract.mint(key, address)
        console.log(key)
    }


    return <div>
        <div>
        <DatePicker selected={nft.from} onChange={(date) => setNft({...nft, from: date})} />
        <DatePicker selected={nft.to} onChange={(date) => setNft({...nft, to: date})} />

            
        </div>
        <div>
            <p>Drop NFT</p>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address" />
            <button onClick={drop}>Drop</button>
        </div>
        <p>Or</p>
        <button>Get link</button>
    </div>
}


export default ManageNft


export async function getServerSideProps(context: any) {
    const contractId = context.params.id;
    let contract;
    try {
        const contractRes = await api.getContract(contractId);
        contract = contractRes.contract
    } catch (e) { }

    return {
        props: { contract },
    };
}

