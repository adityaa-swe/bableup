import React from "react";
import { Link } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

const MenuBar: React.FC = () => {
  return (
    <div className="py-2">
      <div
        id="mid-links"
        className="flex flex-col items-start gap-2 min-[770px]:hidden justify-start"
      >
        <Link
          to=""
          className="w-full font-medium text-[16px] hover:bg-stone-200 rounded-lg px-2 py-2 flex flex-row items-center justify-between"
        >
          About us
          <ArrowOutwardIcon />
        </Link>
        <Link
          to=""
          className="w-full font-medium text-[16px] hover:bg-stone-200 rounded-lg px-2 py-2 flex flex-row items-center justify-between"
        >
          Features
          <ArrowOutwardIcon />
        </Link>
        <Link
          to=""
          className="w-full font-medium text-[16px] hover:bg-stone-200 rounded-lg px-2 py-2 flex flex-row items-center justify-between"
        >
          Support
          <ArrowOutwardIcon />
        </Link>
        <Link
          to=""
          className="w-full font-medium text-[16px] hover:bg-stone-200 rounded-lg px-2 py-2 flex flex-row items-center justify-between"
        >
          Login/SignUp
          <ArrowOutwardIcon />
        </Link>
        <Link
          to=""
          className="w-full font-medium text-[16px] hover:bg-stone-200 rounded-lg px-2 py-2 flex flex-row items-center justify-between"
        >
          Settings
          <ArrowOutwardIcon />
        </Link>
      </div>
    </div>
  );
};

export default MenuBar;
