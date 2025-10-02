import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.ObjectId, ref: "chat", required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Message", messageSchema);
