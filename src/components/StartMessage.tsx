import React from "react";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import ChatIcon from '@mui/icons-material/Chat';

const StartMessage: React.FC = () => {
  return (
    <div className="text-center flex flex-col gap-2">
      <div id="head-wrapper" className="flex flex-col gap-2">
        <span>
          <WavingHandIcon />    
        </span>
        <h1 className="text-xl">Hello, Ana!</h1>
      </div>
      <div id="text-wrapper" className="text-stone-600">
        <p>
          You haven’t started a chat yet. To begin, <ChatIcon /> tap the button above to
          find <br /> friends by their username and start your first conversation.
        </p>
      </div>
    </div>
  );
};

export default StartMessage;
