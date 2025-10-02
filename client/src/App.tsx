import React from "react";
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./RoutesConfig";
import { useUserStore } from "./modules/auth/store/useUserStore";
import Loading from "./components/Loading";

const App: React.FC = () => {
  const { loading } = useUserStore();
  return (
    <>
      <div className="w-[80vw] max-sm:w-[95vw] mx-auto max-[800px]:w-[80vw]">
        {loading ? (
          <div className="my-24">
            <Loading />
          </div>
        ) : (
          <BrowserRouter>
            <RoutesConfig />
          </BrowserRouter>
        )}
      </div>
    </>
  );
};

export default App;
