import React from "react";
import LockPersonIcon from "@mui/icons-material/LockPerson";

const PassMessage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center gap-2 w-[40vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center mx-auto mt-24 p-1 rounded-lg">
      <div id="head" className="flex flex-col items-center text-center">
        <span>
          <LockPersonIcon fontSize="large" />
        </span>
        <h1 className="text-lg font-semibold">Secure Your Account!</h1>
      </div>
      <div id="msg-wrapper" className="text-center">
       If this email is registered, you’ll receive a verification link. <br className="md:hidden"/> Please follow the instructions to continue.
      </div>
    </div>
  );
};

export default PassMessage;
