import React from "react";
import { blockUser } from "../hooks/useUpdate";
import { useUserStore } from "../../auth/store/useUserStore";
import { deleteChat } from "../hooks/useChats";
import { signOut } from "firebase/auth";
import { auth } from "../../auth/config/configFirebase";

interface chatOptions {
  closeChatOption: () => void;
  chatId: string | null;
  otherUserId: string | null;
}

const ChatOptions: React.FC<chatOptions> = ({
  closeChatOption,
  chatId,
  otherUserId,
}) => {
  const { custom } = useUserStore();
  const userId = custom?.userId;

  const blockCurrentUser = async () => {
    if (!otherUserId || !userId) {
      return;
    }

    const block = await blockUser(userId, otherUserId);

    if (!block?.success) {
      return false;
    }

    alert(block.message);
    return;
  };

  const deleteChatForUser = async () => {
    if (!chatId || !userId) {
      return;
    }

    const storedChats = sessionStorage.getItem("bableup");
    const token = await auth.currentUser?.getIdToken();

    try {
      const isDelete = await deleteChat(userId, chatId, token);

      if (!isDelete.success) {
        return false;
      }

      if (storedChats) {
        const chats = JSON.parse(storedChats) as any[];
        const updateChat = chats.map((chat) => ({
          ...chat,
          members: chat.members.filter((id: string) => id !== userId),
        }));

        sessionStorage.setItem("bableup", JSON.stringify(updateChat));
      }

      window.location.reload();
      return;
    } catch (error: any) {
      return;
    }
  };

  const logoutUser = () => {
    if (!userId) {
      return;
    } else {
      signOut(auth);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={closeChatOption}
    >
      <div
        className="flex flex-col gap-2 w-64 p-2 bg-white rounded-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="links-wrapper">
          <button
            onClick={() => window.history.back()}
            className="w-full flex flex-row justify-between gap-2 cursor-pointer px-2 py-2 rounded-lg"
          >
            <span className="flex flex-row items-center gap-2">
              <span className="material-symbols-outlined">close</span>
              <span className="flex flex-row items-center gap-2">
                Close this Chat
              </span>
            </span>
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </button>
          <button
            className="w-full flex flex-row justify-between gap-2 cursor-pointer px-2 py-2 rounded-lg"
            onClick={logoutUser}
          >
            <span className="flex flex-row items-center gap-2">
              <span className="material-symbols-outlined">logout</span>
              <span className="flex flex-row items-center gap-2">Logout</span>
            </span>
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </button>
          <button
            className="w-full flex flex-row justify-between gap-2 cursor-pointer px-2 py-2 rounded-lg"
            onClick={blockCurrentUser}
          >
            <span className="flex flex-row items-center gap-2">
              <span className="material-symbols-outlined">block</span>
              <span className="flex flex-row items-center gap-2">
                Block User
              </span>
            </span>
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </button>
          <button
            className="w-full flex flex-row justify-between gap-2 cursor-pointer px-2 py-2 rounded-lg"
            onClick={deleteChatForUser}
          >
            <span className="flex flex-row items-center gap-2">
            <span className="material-symbols-outlined">delete</span>
            <span className="flex flex-row items-center gap-2">
              Delete this Chat
            </span>
            </span>
              <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </button>
        </div>

        <button
          className="bg-teal-700 text-white p-2 rounded-lg hover:bg-teal-900 cursor-pointer"
          onClick={closeChatOption}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChatOptions;
