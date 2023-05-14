import { Schema, model, models, Model, Document } from 'mongoose';

interface ContractAttributes {
  address: string;
  user: Schema.Types.ObjectId;
  metadata: object;
  lock: Schema.Types.ObjectId;
  chainId: number;
}

interface ContractModel extends Model<ContractDocument> {}

export interface ContractDocument extends Document, ContractAttributes {}

const contractSchema = new Schema<ContractDocument, ContractModel>({
  address: String,
  metadata: Object,
  lock: { type: Schema.Types.ObjectId, ref: 'Lock' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Contract: ContractModel =
  models.Contract ||
  model<ContractDocument, ContractModel>('Contract', contractSchema);

export default Contract;
