import { Schema, model, models, Model, Document } from 'mongoose';

interface KeyAccessAttributes {
  contract: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  startTime: number;
  endTime: number;
  tokenUri: string;
  signature: string;
  owner: string;
}

interface KeyAccessModel extends Model<KeyAccessDocument> {}

export interface KeyAccessDocument extends Document, KeyAccessAttributes {}

const keyAccessSchema = new Schema<KeyAccessDocument, KeyAccessModel>({
  startTime: Number,
  endTime: Number,
  tokenUri: String,
  signature: String,
  owner: { type: String, default: null },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
});

const KeyAccess: KeyAccessModel =
  models.KeyAccess ||
  model<KeyAccessDocument, KeyAccessModel>('KeyAccess', keyAccessSchema);

export default KeyAccess;
