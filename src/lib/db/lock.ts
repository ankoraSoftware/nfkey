import { ObjectId } from 'mongodb';
import mongoose, { Schema, model, models, Model, Document } from 'mongoose';

interface LockAttributes {
  name: string;
  type: string;
  apiKey: string;
  user: Schema.Types.ObjectId;
  metadata: object;
}

interface LockModel extends Model<LockDocument> {}

export interface LockDocument extends Document, LockAttributes {}

const lockSchema = new Schema<LockDocument, LockModel>({
  name: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: String,
  apiKey: String,
  metadata: Object,
});

const Lock: LockModel =
  models.Lock || model<LockDocument, LockModel>('Lock', lockSchema);

export default Lock;
