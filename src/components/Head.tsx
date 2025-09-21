import React, { useState } from "react";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MenuBar from "./MenuBar";

const Head: React.FC = () => {
  const [isOpenMenu, setOpenMenu] = useState<boolean>(false);
  const defaultAvatar =
    "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png";
  return (
    <>
      <div className="flex flex-row justify-between py-2 px-2 items-center border border-stone-200 border-l-transparent border-r-transparent border-t-transparent">
        <Link to="/" id="left-logo" className="text-xl font-bold">
          BableUp
        </Link>

        <div
          id="mid-links"
          className="flex flex-row items-center gap-8 max-[770px]:hidden"
        >
          <Link to="" className="hover:underline font-medium text-[16px]">
            About us
          </Link>
          <Link to="" className="hover:underline font-medium text-[16px]">
            Features
          </Link>
          <Link to="" className="hover:underline font-medium text-[16px]">
            Support
          </Link>
          <Link to="/login" className="hover:underline font-medium text-[16px]">
            Get Started
          </Link>
        </div>
        <div id="right-side" className="flex flex-row gap-2">
          <button
            className="px-2 py-2 cursor-pointer rounded-full flex items-center border border-stone-300 hover:bg-stone-200 min-[770px]:hidden"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            {isOpenMenu ? <CloseIcon /> : <MenuIcon fontSize="medium" />}
          </button>
          <button className="rounded-full cursor-pointer">
            <img
              src={`${defaultAvatar}?t=${new Date().getTime()}`}
              width={40}
              height={40}
              className="object-center rounded-full cursor-pointer"
            />
          </button>
        </div>
      </div>
      {isOpenMenu && <MenuBar />}
    </>
  );
};

export default Head;
