import React from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../auth/store/useUserStore";
import { signOut } from "firebase/auth";
import { auth } from "../../auth/config/configFirebase";

interface optionsBar {
  closeBar: () => void;
}

const InboxOptions: React.FC<optionsBar> = ({ closeBar }) => {
  const { custom } = useUserStore();
  const userId = custom?.userId;
  const logoutUser = () => {
    if (!userId) {
      return;
    } else {
      signOut(auth);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={closeBar}
    >
      <div
        className="w-64 bg-white p-4 rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <Link
            to="/profile"
            className="flex flex-row justify-between w-full items-center p-2"
          >
            <span className="flex flex-row items-center gap-2">
              <span className="material-symbols-outlined">person_edit</span>
              <p>Manage Profile</p>
            </span>
            <span className="flex">
              <span className="material-symbols-outlined">
                keyboard_arrow_right
              </span>
            </span>
          </Link>
          <button className="flex flex-row justify-between w-full items-center p-2 cursor-pointer" onClick={logoutUser}>
            <span className="flex flex-row items-center gap-2">
              <span className="material-symbols-outlined">logout</span>
              <p>Logout</p>
            </span>
            <span className="flex">
              <span className="material-symbols-outlined">
                keyboard_arrow_right
              </span>
            </span>
          </button>
          <button
            className="bg-teal-700 p-2 rounded-md hover:bg-teal-900 cursor-pointer text-white"
            onClick={closeBar}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InboxOptions;
