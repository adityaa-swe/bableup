import React, { useEffect, useState } from "react";
import SearchUser from "../components/SearchUser";
import type { otherChat, otherUser } from "../types/userProfile";
import { getChats, getProfileChat } from "../hooks/useChats";
import { useUserStore } from "../../auth/store/useUserStore";
import Loading from "../../../components/Loading";
import InboxOptions from "../components/InboxOptions";
import { useNavigate } from "react-router-dom";
import { auth } from "../../auth/config/configFirebase";

const Inbox: React.FC = () => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isOptionOpen, setOptionOpen] = useState<boolean>(false);
  const [chats, setChats] = useState<otherChat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { custom } = useUserStore();
  const userId = custom?.userId;
  const [searchInput, setSearchInput] = useState<string>("");
  const navigate = useNavigate();

  const filterChats = chats.filter((p) =>
    p.userData.displayName.toLowerCase().includes(searchInput.toLowerCase())
  );

  useEffect(() => {
    const getUserChats = async () => {
      setLoading(true);
      if (!userId) {
        return;
      }

      const cacheStorage = sessionStorage.getItem("bableup");
      if (cacheStorage?.length == 0) {
        setChats(JSON.parse(cacheStorage));
        setLoading(false);
        return;
      }

      const token = await auth.currentUser?.getIdToken();

      const serverChats = await getChats(userId, token);

      if (serverChats.success) {
        let combinedChat: otherChat[] = await Promise.all(
          serverChats.chats.map(async (chat: any) => {
            const otherUserId =
              userId === chat.members[0] ? chat.members[1] : chat.members[0];

            const savedChats = await getProfileChat(otherUserId);

            return { ...chat, ...savedChats };
          })
        );
        setChats(combinedChat);
        sessionStorage.setItem("bableup", JSON.stringify(combinedChat));
        setLoading(false);
      } else {
        setLoading(false);
        setChats([]);
      }
    };

    getUserChats();
  }, [userId]);

  const navigateUser = (chatId: string, user: otherUser) => {
    if (!chatId || !user) {
      return;
    }

    navigate(`/chat/${chatId}`, { state: { otherUser: user } });
  };

  useEffect(() => {
    sessionStorage.setItem("bableup", JSON.stringify(chats));
  }, [chats]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div id="head-wrapper" className="flex flex-col gap-4">
        <div id="head" className="flex flex-row justify-between items-center">
          <h1 className="text-xl font-semibold">BableUp</h1>
          <div>
            <button
              className="cursor-pointer p-2 flex bg-green-800 text-white rounded-lg"
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined">chat_add_on</span>
            </button>
          </div>
        </div>
        <div
          id="second-head"
          className="flex flex-row w-full items-center gap-2"
        >
          <span className="flex flex-row items-center px-2 rounded-md bg-stone-200/80 w-full">
            <span className="material-symbols-outlined text-stone-500">
              search
            </span>
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInput(e.target.value)
              }
              id="search"
              placeholder="Search Here.."
              className="p-2 w-full outline-none"
            />
          </span>
          <span>
            <button
              className="flex p-2 cursor-pointer bg-stone-200 rounded-md"
              onClick={() => setOptionOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </span>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div id="chats-container" className="flex flex-col gap-1">
          {chats.length == 0 ? (
            <div className="flex flex-col items-center justify-center text-md text-center mt-10 text-stone-500">
              <p>
                Get started by clicking the button <br /> above to find users
                and start a conversation.
              </p>
            </div>
          ) : (
            filterChats.map((userChat) => (
              <div
                id="chat"
                className="flex flex-row items-center gap-4 p-2 cursor-pointer"
                key={userChat._id}
                onClick={() => navigateUser(userChat._id, userChat.userData)}
              >
                <div className="w-fit rounded-full">
                  <img
                    src={
                      userChat.userData.imageUrl ||
                      "https://avatar.iran.liara.run/public"
                    }
                    alt="profile_image"
                    className="w-17 h-15 rounded-full object-cover"
                  />
                </div>
                <div id="wrapper" className="flex flex-col w-full gap-0.5">
                  <div className="flex flex-row w-full justify-between items-start">
                    <span className="text-md font-medium">
                      {userChat.userData.displayName}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {new Date(userChat.updatedAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hourCycle: "h11",
                        }
                      )}
                    </span>
                  </div>
                  <div className="text-md text-stone-500">
                    {userChat.lastMessage || "Start chatting!"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {isOpen && <SearchUser closeBar={() => setOpen((prev) => !prev)} />}
      {isOptionOpen && (
        <InboxOptions closeBar={() => setOptionOpen((prev) => !prev)} />
      )}
    </div>
  );
};

export default Inbox;
