import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
