import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
let host = process.env.HOST || "localhost";
mongoose.connect(`mongodb://${host}/forest`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { mongoose };
