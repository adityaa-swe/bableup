import React from "react";
import { useLocation } from "react-router-dom";

const Message: React.FC = () => {
  const location = useLocation();
  const emailData = location.state?.email || "your-domain@bableup.com";

  return (
    <div className="flex flex-col justify-center gap-2 w-[40vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center mx-auto my-32 p-1 rounded-lg">
      <div id="head" className="flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-2xl">
          mark_email_read
        </span>
        <h1 className="text-xl font-semibold">Verification Email Sent!</h1>
      </div>
      <div id="msg-wrapper" className="text-center text-stone-500">
        We’ve sent a verification email to{" "}
        <span className="font-medium text-black">{emailData}</span>. <br />
        Please check your inbox and click the verification link to confirm your
        account.
      </div>
    </div>
  );
};

export default Message;
