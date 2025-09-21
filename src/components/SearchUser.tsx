import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { db } from "../services/config";
import { collection, getDocs } from "firebase/firestore";

interface SearchUserProps {
  closeCard: () => void;
}

interface userType {
  uid: string;
  photoUrl: string | null;
  username: string | null;
  displayName: string | null;
}

const SearchUser: React.FC<SearchUserProps> = ({ closeCard }) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  React.useEffect(() => {
    setOpen(true);
  }, []);

  const [users, setUsers] = useState<userType[]>([]);
  const [input, setInput] = useState<string>("");

  const getUsers = async (input: string) => {
    if (!input) {
      setUsers([]);
      return;
    }

    try {
      const userCol = collection(db, "users");
      const getUsers = await getDocs(userCol);

      const matchedUsers: userType[] = getUsers.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          username: data.profile?.username || null,
          displayName: data.profile?.displayName || null,
          photoUrl: data.profile?.photoUrl || null,
        }
      }).filter((user) => user.username?.toLowerCase().includes(input.toLowerCase()));

      setUsers(matchedUsers);
      console.log(users, "working");
      
    } catch (error: any) {
      console.log(error.message);
      setUsers([]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    getUsers(value);
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={closeCard}
    >
      <div
        className={`flex flex-col gap-1 w-fit p-2 bg-white rounded-lg z-50 transform transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          id="head-wrapper"
          className="flex flex-row items-center border border-stone-200 px-2 rounded-lg w-full"
        >
          <SearchIcon />
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search here..."
            className="outline-none py-2 px-2 w-full"
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                getUsers(input);
              }
            }}
          />
        </div>
        <div id="all-user-wrapper" className="h-64 overflow-y-auto">
          {users.length == 0 ? (
            <div className="text-center p-2">No User Found!</div>
          ) : (
            users.map((user) => (
              <div
                id="main-user-wrapper"
                key={user.uid}
                onClick={() => console.log(user.uid)}
                className="flex flex-row justify-between py-2 hover:bg-stone-200 px-2 cursor-pointer rounded-lg"
              >
                <div
                  id="user-info-wrapper"
                  className="flex flex-row items-center gap-4"
                >
                  <span>
                    <img
                      src={user.photoUrl || "https://avatar.iran.liara.run/public"}
                      alt="profile_image"
                      width={55}
                      height={55}
                      className="object-fill rounded-full"
                    />
                  </span>
                  <span className="flex flex-col">
                    <p className="text-md font-semibold">{user.displayName}</p>
                    <p className="text-[15px] text-stone-600">
                      @{user.username}
                    </p>
                  </span>
                </div>
                <button className="p-2 cursor-pointer w-fit rounded-lg">
                  <QuestionAnswerIcon />
                </button>
              </div>
            ))
          )}
        </div>
        <button
          className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-950 cursor-pointer"
          onClick={closeCard}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SearchUser;
