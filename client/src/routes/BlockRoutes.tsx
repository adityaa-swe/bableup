import React, { type JSX } from "react";
import { useUserStore } from "../modules/auth/store/useUserStore";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const BlockRoutes: React.FC<Props> = ({ children }) => {
  const { custom, firebase } = useUserStore();

  if (custom?.userId || firebase) {
    return <Navigate to="/inbox" replace />;
  }

  return children;
};

export default BlockRoutes;
