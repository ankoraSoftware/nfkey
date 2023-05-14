import { api } from '@/lib/api';
import { ContractDocument } from '@/lib/db/contract';
import { KeyAccessDocument } from '@/lib/db/key-access';
import { UserDocument } from '@/lib/db/user';
import React from 'react';
import { ContractHelper } from '@/helpers/contract';
import { Helper } from '@/helpers/helper';
import { useRouter } from 'next/router';

interface IKeyAccess extends Omit<KeyAccessDocument, 'user' | 'contract'> {
  user: UserDocument;
  contract: ContractDocument;
}

const Claim = ({ keyAccess }: { keyAccess: IKeyAccess }) => {
  const router = useRouter();
  const claim = async () => {
    const contract = await ContractHelper.init(keyAccess.contract.address);
    const address = await contract.signer.getAddress();
    // TODO handle errors like signature already used or invalid signature and etc
    const tx = await contract.mint(
      [keyAccess.tokenUri, keyAccess.startTime, keyAccess.endTime],
      address,
      keyAccess.signature
    );
    await api.claim({ id: keyAccess._id, owner: address });
    await tx.wait();
    router.push('/');
  };
  return (
    <div className="flex flex-col  w-full items-center md:items-start mx-auto px-2 mt-2">
      <h3 className="text-2xl mb-2">Claim your NFT</h3>
      <p>
        <span className="text-orange-500">
          {Helper.shortenAddress(keyAccess.user.wallet)}
        </span>{' '}
      </p>
      <button
        className="bg-orange-500 rounded-lg p-1 w-[70%] md:max-w-[150px] min-w-[150px] min-h-[50px] hover:bg-orange-400 text-white my-3"
        onClick={claim}
      >
        Claim
      </button>
      <p>
        Invited you to claim NFT from{' '}
        <span className="text-orange-500">
          {(keyAccess.contract.metadata as any).name}
        </span>
      </p>
    </div>
  );
};

export default Claim;

export async function getServerSideProps(context: any) {
  const keyAccessId = context.params.id;
  let keyAccess;
  try {
    const keyAccessRes = await api.getKeyAccess(keyAccessId);
    keyAccess = keyAccessRes.keyAccess;
  } catch (e) {}

  if (keyAccess?.owner) {
    throw Error('KeyAlreadyClaimed');
  }

  return {
    props: { keyAccess },
  };
}
