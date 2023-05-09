import mongoose from "mongoose";

const db = async () => mongoose.connect(process.env.MONGODB_URI as string);

export default db;
