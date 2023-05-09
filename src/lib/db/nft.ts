import { ObjectId } from "mongodb";
import { Schema, model, models, Model, Document } from "mongoose";

export interface Metadata {
  image: string;
  name: string;
  description: string;
  external_link: string;
}

export interface NftAttributes {
  user: string;
  metadata: Metadata;
}

interface NftModel extends Model<NftDocument> {}

export interface NftDocument extends Document, NftAttributes {}

const nftSchema = new Schema<NftDocument, NftModel>({
  user: ObjectId,
  metadata: Object,
});

const Nft: NftModel =
  models.Nft || model<NftDocument, NftModel>("Nft", nftSchema);

export default Nft;
