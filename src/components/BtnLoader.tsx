import React from "react";

const BtnLoader: React.FC = () => {
  return (
    <div>
      <div id="loader" className="w-5 animate-spin border-stone-200 rounded-full flex border-t-transparent h-5 border-2"></div>
    </div>
  );
};

export default BtnLoader;
