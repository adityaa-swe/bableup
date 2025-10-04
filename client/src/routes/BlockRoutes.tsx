import React, { type JSX } from "react";
import { useUserStore } from "../modules/auth/store/useUserStore";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
  exception: string[];
}

const BlockRoutes: React.FC<Props> = ({ children, exception = [] }) => {
  const { custom, firebase } = useUserStore();
  const location = useLocation();

  if (exception.includes(location.pathname)) {
    return children;
  }
  
  if (custom?.isEmailVerified || firebase) {
    return <Navigate to="/inbox" replace />;
  }


  return children;
};

export default BlockRoutes;
