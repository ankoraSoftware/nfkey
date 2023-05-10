import { api } from '@/lib/api';
import { ContractDocument } from '@/lib/db/contract';
import { KeyAccessDocument } from '@/lib/db/key-access';
import { UserDocument } from '@/lib/db/user';
import React from 'react';
import { ContractHelper } from '@/helpers/contract';

interface IKeyAccess extends Omit<KeyAccessDocument, 'user' | 'contract'> {
  user: UserDocument;
  contract: ContractDocument;
}

const Claim = ({ keyAccess }: { keyAccess: IKeyAccess }) => {
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
  };
  return (
    <div>
      claim
      <p>
        {keyAccess.user.wallet} invited you to claim NFT from{' '}
        {(keyAccess.contract.metadata as any).name}
      </p>
      {/*
      Connect button
      */}
      <button onClick={claim}>Claim</button>
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
