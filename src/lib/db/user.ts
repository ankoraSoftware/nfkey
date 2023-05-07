import { Schema, model, models, Model, Document } from "mongoose";

interface UserAttributes {
  wallet: string;
}

interface UserModel extends Model<UserDocument> {}

export interface UserDocument extends Document, UserAttributes {}

const userSchema = new Schema<UserDocument, UserModel>({
  wallet: String,
});

const User: UserModel =
  models.User || model<UserDocument, UserModel>("User", userSchema);

export default User;
