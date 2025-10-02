import React, { useEffect, useRef, useState } from "react";
import type { userMessage } from "../types/userProfile";
import { getMessages } from "../hooks/useMessage";
import { io, Socket } from "socket.io-client";
import { getAuth } from "firebase/auth";
import { useUserStore } from "../../auth/store/useUserStore";
import { useLocation, useParams } from "react-router-dom";
import UserCard from "../components/UserCard";
import ChatOptions from "../components/ChatOptions";
import Loading from "../../../components/Loading";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<userMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isActive, setActive] = useState<boolean>(true);
  const [isOpen, setOpen] = useState<boolean>(false);

  const [isOpenOpt, setOpenOpt] = useState<boolean>(false);
  const [isBlock, setBlock] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();

  const otherUser = location.state.otherUser;
  const [input, setInput] = useState<string>("");
  const { custom } = useUserStore();
  const currentUserId = custom?.userId;

  const socketRef = useRef<Socket | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId || !currentUserId || !otherUser) return;

    const initChat = async () => {
      setLoading(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const fetchMessages = await getMessages(chatId, token);
      if (fetchMessages.success) {
        setMessages(fetchMessages.data);
      }

      const serverUrl = import.meta.env.VITE_SERVER_URL;
      const socketInstance = io(`${serverUrl}`, { auth: { token } });

      socketRef.current = socketInstance;

      socketInstance.on("connect", () => console.log("Connected"));

      socketInstance.emit("joinRoom", chatId);

      socketInstance.on("errorMessage", (err) => {
        if (err.code == "BLOCKED") {
          setBlock(true);
          return;
        }
      });

      const newMessage = (message: userMessage) => {
        const receiveMsg = {
          _id: message._id,
          chatId: chatId,
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt
        };

        setMessages((prev) => [...prev, receiveMsg]);
      };

      socketInstance.on("newMessage", newMessage);

      socketInstance.on("userOnline", (userId: string) => {
        if (otherUser.userId == userId) {
          setActive(true);
        }
      });

      socketInstance.on("userOffline", (userId: string) => {
        if (otherUser.userId == userId) {
          setActive(false);
        }
      });

      socketInstance.on("currentOnlineUsers", (onlineUsersId: string[]) => {
        setActive(onlineUsersId.includes(otherUser.userId));
      });

      return () => {
        socketRef.current?.off("newMessage");
        socketRef.current?.disconnect();
      };
    };

    initChat().finally(() => setLoading(false));
  }, [chatId, currentUserId]);

  const sendMessage = () => {
    if (!input) {
      return;
    }

    if (!chatId || !currentUserId) {
      return;
    }

    const newMsg = {
      chatId,
      sender: currentUserId,
      text: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    socketRef.current?.emit("chatMessage", {
      chatId,
      text: input.trim(),
      sender: currentUserId,
    });
    setInput("");
    return;
  };

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-2 h-screen max-w-screen mx-auto rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-2 shadow-md">
            <div className="flex items-center gap-2 cursor-pointer">
              <button
                className="p-1 flex cursor-pointer"
                onClick={() => window.history.back()}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <img
                src={
                  otherUser.imageUrl || "https://avatar.iran.liara.run/public"
                }
                alt="profile_image"
                className="w-12 h-12 rounded-full object-cover"
                onClick={() => setOpen((prev) => !prev)}
              />
              <div className="flex flex-col">
                <span className="text-md font-semibold truncate">
                  {otherUser.displayName}
                </span>
                <span className="text-sm text-stone-500">
                  {isActive ? "online" : "offline"}
                </span>
              </div>
            </div>
            <button
              className="p-2 flex cursor-pointer"
              onClick={() => setOpenOpt((prev) => !prev)}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div
            id="message-container"
            className="flex-1 overflow-y-auto p-2 flex flex-col gap-2"
          >
            {messages.map((msg, i) => {
              const isSender = msg.sender === currentUserId;

              return (
                <div
                  key={i}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col max-w-[75%] px-4 py-2 gap-1 rounded-xl ${
                      isSender
                        ? "bg-purple-800 text-white rounded-tr-none"
                        : "bg-teal-900 text-white rounded-tl-none"
                    }`}
                  >
                    <span className="font-medium break-words">{msg.text}</span>
                    <span
                      className={`text-xs opacity-50 ${
                        isSender ? "self-end" : "self-start"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h11",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messageRef}></div>
          </div>
          {isBlock ? (
            <div className="text-center text-md my-2 font-semibold">
              You are Blocked by this user!
            </div>
          ) : (
            <div className="p-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="message"
                  id="message"
                  autoFocus
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="w-full border border-stone-300 py-2 px-3 rounded-md outline-none"
                  placeholder="Your message..."
                />
                <button
                  className="bg-teal-700 flex text-white p-2 rounded-md cursor-pointer"
                  onClick={sendMessage}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          )}
          {isOpen && (
            <UserCard
              closeProfile={() => setOpen((prev) => !prev)}
              userData={otherUser}
            />
          )}
          {isOpenOpt && (
            <ChatOptions
              closeChatOption={() => setOpenOpt((prev) => !prev)}
              otherUserId={otherUser.userId ?? null}
              chatId={chatId ?? null}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
