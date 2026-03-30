import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DBconniction = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB (Config => DBconniction):", error.message);
  }
};

export default DBconniction;