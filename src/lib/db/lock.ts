import { Schema, model, models, Model, Document } from "mongoose";

interface LockAttributes {
  name: string;
  type: string;
  apiKey: string;
}

interface LockModel extends Model<LockDocument> {}

export interface LockDocument extends Document, LockAttributes {}

const lockSchema = new Schema<LockDocument, LockModel>({
  name: String,
  type: String,
  apiKey: String,
});

const Lock: LockModel =
  models.Lock || model<LockDocument, LockModel>("Lock", lockSchema);

export default Lock;
