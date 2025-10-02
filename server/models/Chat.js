import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [{ type: String, requird: true }],
    lastMessage: { type: String },
    updatedAt: { type: Date, default: Date.now },
    deletedFor: [{ type: String }],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Chat", chatSchema);
