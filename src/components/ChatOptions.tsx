import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Logout } from "@mui/icons-material";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from '@mui/icons-material/Delete';

interface chatOptionsProps {
  closeChatProps: () => void;
}

const ChatOptions: React.FC<chatOptionsProps> = ({ closeChatProps }) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  React.useEffect(() => {
    setOpen(true);
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={closeChatProps}
    >
      <div
        className={`flex flex-col gap-2 w-[20vw] max-[1030px]:w-[50vw] max-[480px]:w-[90vw] p-2 bg-white rounded-lg z-50 transform transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div id="links-wrapper">
          <Link
            to="/"
            className="w-full flex flex-row justify-between cursor-pointer px-2 py-2 hover:bg-stone-200 rounded-lg"
          >
            <span className="flex flex-row items-center gap-2">
              <CloseIcon />
              Close this Chat
            </span>
          </Link>
          <Link
            to="/"
            className="w-full flex flex-row justify-between cursor-pointer px-2 py-2 hover:bg-stone-200 rounded-lg"
          >
            <span className="flex flex-row items-center gap-2">
              <NotInterestedIcon />
              Block User
            </span>
          </Link>
          <Link
            to="/"
            className="w-full flex flex-row justify-between cursor-pointer px-2 py-2 hover:bg-stone-200 rounded-lg"
          >
            <span className="flex flex-row items-center gap-2">
              <Logout />
              Logout
            </span>
            <ArrowOutwardIcon />
          </Link>
          <Link
            to="/"
            className="w-full flex flex-row justify-between cursor-pointer px-2 py-2 hover:bg-stone-200 rounded-lg"
          >
            <span className="flex flex-row items-center gap-2">
              <DeleteIcon />
              Delete this Chat
            </span>
          </Link>
        </div>

        <button
          className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-950 cursor-pointer"
          onClick={closeChatProps}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChatOptions;
