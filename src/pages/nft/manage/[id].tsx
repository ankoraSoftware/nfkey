import { getProvider } from '@/components/Web3Modal';
import { ContractHelper } from '@/helpers/contract';
import { Helper } from '@/helpers/helper';
import { api } from '@/lib/api';
import { ContractDocument } from '@/lib/db/contract';
import { KeyAccessDocument } from '@/lib/db/key-access';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface NftValue {
  from: null | Date;
  to: null | Date;
  tokenUri: '';
  signature: '';
}

const ManageNft = ({
  contract,
  keyAccesses,
}: {
  contract: ContractDocument;
  keyAccesses: KeyAccessDocument[];
}) => {
  console.log(keyAccesses, 'ads');
  const [nft, setNft] = useState<NftValue>({
    from: null,
    to: null,
    tokenUri: '',
    signature: '',
  });
  const [address, setAddress] = useState('');
  const [link, setLink] = useState('');

  const createMetadataAndSignature = async () => {
    const metadata = contract.metadata;
    const hash = await Helper.uploadJsonToIpfs(metadata);
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const types = {
      Key: [
        { name: 'tokenUri', type: 'string' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
      ],
    };

    const key = {
      tokenUri: `ipfs://${hash}`,
      startTime: nft.from?.getTime(),
      endTime: nft.to?.getTime(),
    };

    const signature = await signer._signTypedData(
      {
        name: 'NFKey',
        version: '1',
        verifyingContract: contract.address,
        chainId: 80001,
      },
      types,
      key
    );
    const { keyAccess } = await api.createKeyAccess({
      contract: contract._id,
      signature,
      startTime: key.startTime,
      endTime: key.endTime,
      tokenUri: key.tokenUri,
    });
    return {
      key: [key.tokenUri, key.startTime, key.endTime],
      signature,
      keyAccess,
    };
  };

  const drop = async () => {
    const { key, signature } = await createMetadataAndSignature();
    const web3Contract = await ContractHelper.init(contract.address);
    const tx = await web3Contract.mint(key, address, signature);
    await api.updateKeyAccess({ signature, owner: address });
    await tx.wait();
  };

  const generateLink = async () => {
    const { keyAccess } = await createMetadataAndSignature();
    setLink(`${window.origin}/claim/${keyAccess._id}`);
  };

  return (
    <div>
      <div>
        <DatePicker
          selected={nft.from}
          onChange={(date) => setNft({ ...nft, from: date })}
        />
        <DatePicker
          selected={nft.to}
          onChange={(date) => setNft({ ...nft, to: date })}
        />
      </div>
      <div>
        <p>Drop NFT</p>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Wallet address"
        />
        <button onClick={drop}>Drop</button>
      </div>
      <p>Or</p>
      <button onClick={generateLink}>Get link</button>
      {link && <p>{link.substring(0, 100)}</p>}
    </div>
  );
};

export default ManageNft;

export async function getServerSideProps(context: any) {
  const contractId = context.params.id;
  let contract;
  let keyAccesses = [];
  try {
    const contractRes = await api.getContract(contractId);
    contract = contractRes.contract;
    const keyAccessesRes = await api.getKeyAccesses(contractId);
    keyAccesses = keyAccessesRes.keyAccesses;
  } catch (e) {}

  return {
    props: { contract, keyAccesses },
  };
}
