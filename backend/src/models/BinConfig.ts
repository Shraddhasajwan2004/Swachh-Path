import mongoose from "mongoose";

const binConfigSchema = new mongoose.Schema({
  binId: { type: String, required: true },
  name: { type: String, required: true },
  channelId: { type: String, required: true },
  readApiKey: { type: String, required: true },
  writeApiKey: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const BinConfig = mongoose.model("BinConfig", binConfigSchema);
