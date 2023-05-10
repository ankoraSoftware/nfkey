import { api } from "@/lib/api";
import { ContractDocument } from "@/lib/db/contract"



const ManageNft = ({contract}: {contract: ContractDocument}) => {

    console.log(contract)

    
    return <div>Omer</div>
}


export default ManageNft


export async function getServerSideProps(context: any) {
    const contractId = context.params.id;
    let contract;
    try {
      contract = await api.getContract(contractId);
    } catch (e) {}
  
    return {
      props: { contract },
    };
  }
  
