import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const createChat = async (req, res) => {
  try {
    let { members } = req.body;
    if (!members || members.length < 2) {
      return res.status(400).json({ error: "Users Required!" });
    }

    let chat = await Chat.findOne({
      members: { $all: members, $size: members.length },
    });

    if (!chat) {
      chat = await Chat.create({
        members: members,
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errMsg: "Internal Server Error", error: error.message });
  }
};

export const getChats = async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!userId) {
      return res.status(400).json({
        message: "UserId is required!",
      });
    }

    let chatExist = await Chat.find({
      members: { $all: [userId] },
    }).sort({ updatedAt: -1 });

    const filteredChats = chatExist.filter(
      (chat) => !chat.deletedFor.includes(userId)
    );

    if (filteredChats.length == 0) {
      return res.status(400).json({
        message: "Chat does not exist!",
      });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(filteredChats);
    
  } catch (error) {
    return res.status(500).json({
      errMsg: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({
        errMsg: "chatId is required!",
      });
    }
    const messages = await Message.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errMsg: "Internal Server Error", error: error.message });
  }
};

export const deleteChatForUser = async (req, res) => {
  try {
    let chatId = req.params.chatId;
    let userId = req.params.userId;

    if (!chatId && !userId) {
      return res.status(400).json({
        errMsg: "IDs are required!",
      });
    }

    const findChat = await Chat.findById(chatId);

    if (!findChat) {
      return res.status(400).json({ errMsg: "Chat not exist!" });
    }

    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { deletedFor: userId }, updatedAt: Date.now() },
      { new: true }
    );

    return res.status(200).json({ updateChat });
  } catch (error) {
    return res.status(500).json({
      errMsg: "Internal Server Error",
      error: error.message,
    });
  }
};
