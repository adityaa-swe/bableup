import React from "react";
import DraftsIcon from "@mui/icons-material/Drafts";
import { useLocation } from "react-router-dom";
import { auth } from "../services/config";
import { sendEmailVerification } from "firebase/auth";

const Message: React.FC = () => {
  const location = useLocation();
  const emailData = location.state?.email || "your-domain@bableup.com";
  const resendMsg = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      console.log("Message Sent");
      return;
    } else {
      console.log("Failed");
      
    }
    
  };
  return (
    <div className="flex flex-col justify-center gap-2 w-[40vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center mx-auto mt-24 p-1 rounded-lg">
      <div id="head" className="flex flex-col items-center text-center">
        <span>
          <DraftsIcon fontSize="large" />
        </span>
        <h1 className="text-lg font-semibold">Verification Email Sent!</h1>
      </div>
      <div id="msg-wrapper" className="text-center">
        We’ve sent a verification email to <b>{emailData}</b>. <br />
        Please check your inbox and click the verification link to confirm your
        account.
      </div>
      <button
        onClick={resendMsg}
        className="bg-blue-900 text-white w-full text-center p-2 rounded-lg cursor-pointer hover:bg-blue-950 transition-all"
      >
        Resend Link
      </button>
    </div>
  );
};

export default Message;
