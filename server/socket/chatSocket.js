import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import admin from "firebase-admin";

const onlineUsers = new Map();
const chatCache = new Map();
const tokenCache = new Map();
const blockedCache = new Map();

function setCache(map, key, value, ttl = 30_000) {
  map.set(key, value);
  setTimeout(() => map.delete(key), ttl).unref();
}

export const authUsersForSocket = async (token) => {
  if (!token) return null;
  if (tokenCache.has(token)) return tokenCache.get(token);

  try {
    const confirmUser = await admin.auth().verifyIdToken(token);
    setCache(tokenCache, token, confirmUser, 10 * 60 * 1000);
    return confirmUser;
  } catch (err) {
    console.error("token error : ", err.message);
    return null;
  }
};

export const getChat = async (chatId) => {
  if (chatCache.has(chatId)) return chatCache.get(chatId);

  const chat = await Chat.findById(chatId).lean();
  if (chat) setCache(chatCache, chatId, chat, 10_000);
  return chat;
};

export const getBlockedList = async (userId) => {
  if (blockedCache.has(userId)) return blockedCache.get(userId);

  const doc = await admin.firestore().collection("users").doc(userId).get();
  const blocked = doc.data().relations.blocked || [];
  setCache(blockedCache, userId, blocked, 30_000);
  return blocked;
};

export const initChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Unauthorized!"));
      }

      const confirmUser = await authUsersForSocket(token);
      if (!confirmUser) return next(new Error("Unauthorized!"));

      socket.user = confirmUser;
      next();
    } catch (err) {
      console.error(err);
      return;
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.uid;

    console.log(userId, "is online");

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    socket.joinedRooms = new Set();

    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      socket.joinedRooms.add(chatId);

      socket.to(chatId).emit("userOnline", userId);
      socket.emit("currentOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("chatMessage", async ({ chatId, text }) => {
      try {
        let chat = await getChat(chatId);
        if (!chat || !userId) {
          socket.emit("errorMessage", { code: "CHAT_NOT_FOUND" });
          return;
        }
        chatCache.delete(chatId);
        await getChat(chatId);

        if (chat.deletedFor && chat.deletedFor.length > 0) {
          await Chat.updateOne(
            { _id: chatId },
            {
              $pull: { deletedFor: { $in: chat.deletedFor } },
              $addToSet: { members: { $each: chat.deletedFor } },
            }
          );
        }

        chat = await getChat(chatId);

        for (const member of chat.members) {
          if (member !== userId) {
            const blocked = await getBlockedList(member);
            if (blocked.includes(userId)) {
              socket.emit("errorMessage", { code: "BLOCKED" });
              return;
            }
          }
        }

        const message = await Message.create({
          chatId,
          sender: userId,
          text,
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text,
          updatedAt: Date.now(),
        });

        socket.to(chatId).emit("newMessage", message);
        socket.emit("messageSent", message);
      } catch (err) {
        console.error(err);
        socket.emit("errorMessage", { code: "SERVER_ERROR" });
      }
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId)) {
        onlineUsers.get(userId).delete(socket.id);

        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          for (const roomId of socket.joinedRooms) {
            socket.to(roomId).emit("userOffline", userId);
          }
        }
      }
    });
  });
};
