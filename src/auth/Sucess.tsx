import React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Link } from "react-router-dom";

const Sucess: React.FC = () => {

  return (
    <div className="flex flex-col justify-center gap-4 w-[40vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center mx-auto mt-24 p-1 rounded-lg">
      <div id="head" className="flex flex-col items-center gap-2 text-center">
        <span>
          <CheckCircleOutlineIcon fontSize="large" />
        </span>
        <h1 className="text-lg font-semibold">Email Verified!</h1>
      </div>
      <div id="msg-wrapper" className="text-center">
        Your email has been successfully verified. You can now access all
        features of your account.
      </div>
      <Link
        to="/dashboard"
        className="bg-blue-900 text-white w-full text-center p-2 rounded-lg hover:bg-blue-950 transition-all"
      >
        Go to Chat
      </Link>
    </div>
  );
};

export default Sucess;
