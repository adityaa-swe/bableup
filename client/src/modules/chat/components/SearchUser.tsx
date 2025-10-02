import React, { useState } from "react";
import { useSearchUsers } from "../hooks/useUsers";
import type { otherUser } from "../types/userProfile";
import Loading from "../../../components/Loading";
import { startChat } from "../hooks/useChats";
import { useUserStore } from "../../auth/store/useUserStore";
import { useNavigate } from "react-router-dom";
import { auth } from "../../auth/config/configFirebase";

interface searchBar {
  closeBar: () => void;
}

const SearchUser: React.FC<searchBar> = ({ closeBar }) => {
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<otherUser[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { custom } = useUserStore();
  const userId = custom?.userId;
  const navigate = useNavigate();

  const runSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const value = e.target.value;
    setInput(value.toLowerCase());

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(async () => {
      if (!userId) {
        return;
      }
      const users = await useSearchUsers(input.trim().toLowerCase(), userId);
      setLoading(false);
      setResults(users);
    }, 500);

    setTimer(newTimer);
    return;
  };

  const createUserChat = async (otherUserId: string, user:otherUser) => {
    if (!userId || !otherUserId) {
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const userChat = await startChat(userId, otherUserId, token);

      if (!userChat.success) {
        return;
      }

      if (userChat.data) {
        navigate(`/chat/${userChat.data._id}`, { state: {otherUser : user} });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={closeBar}
    >
      <div
        className="flex flex-col gap-2 bg-white rounded-md p-4 w-72 h-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row gap-1">
          <span className="flex flex-row items-center px-2 rounded-md bg-stone-200/80 w-full">
            <span className="material-symbols-outlined text-stone-500">
              search
            </span>
            <input
              type="text"
              name="search"
              onChange={runSearch}
              id="search"
              placeholder="Search Username.."
              className="p-2 w-full outline-none"
            />
          </span>
          <button
            className="flex w-fit cursor-pointer hover:bg-stone-200 rounded-md bg-stone-200/80 p-2"
            onClick={closeBar}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {loading ? (
          <div className="h-80">
            <Loading />
          </div>
        ) : (
          <div className="h-80 overflow-auto">
            {results.length == 0 ? (
              <div className="text-center mt-2 text-stone-500">
                We couldn't find any users matching your search.
              </div>
            ) : (
              results.map((user) => (
                <div
                  className="flex flex-row items-center gap-2 p-2 cursor-pointer hover:bg-stone-100 rounded-md"
                  key={user.userId}
                  onClick={() => createUserChat(user.userId, user)}
                >
                  <div className="w-fit rounded-full">
                    <img
                      src={
                        user.imageUrl ||
                        "https://avatar.iran.liara.run/public"
                      }
                      alt="profile_image"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <div id="wrapper">
                    <div className="flex flex-col w-full items-start">
                      <span className="text-md font-semibold">
                        {user.displayName}
                      </span>
                      <div className="text-md text-stone-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUser;
