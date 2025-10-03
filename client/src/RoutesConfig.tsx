import { Route, Routes } from "react-router-dom";
import SignUp from "./modules/auth/pages/SignUp";
import Login from "./modules/auth/pages/Login";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import ResetPassword from "./modules/auth/pages/ResetPassword";
import EmailVerification from "./modules/auth/pages/EmailVerification";
import BlockRoutes from "./routes/BlockRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Inbox from "./modules/chat/pages/Inbox";
import Chat from "./modules/chat/pages/Chat";
import UserProfile from "./modules/chat/pages/UserProfile";

const RoutesConfig = () => {
    return (
        <>
            <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<BlockRoutes><SignUp /></BlockRoutes>} />
                <Route path="/login" element={<BlockRoutes><Login /></BlockRoutes>} />
                <Route path="/forgot-password" element={<BlockRoutes><ForgotPassword /></BlockRoutes>} />
                <Route path="/reset-password" element={<BlockRoutes exception={["/reset-password"]}><ResetPassword /></BlockRoutes>} />
                <Route path="/auth-mail" element={<BlockRoutes exception={["/auth-mail"]}><EmailVerification /></BlockRoutes>} />

                {/* Chat Routes */}
                <Route path="/inbox" element={<ProtectedRoutes><Inbox /></ProtectedRoutes>} />
                <Route path="/chat/:chatId" element={<ProtectedRoutes><Chat /></ProtectedRoutes>} />
                <Route path="/profile" element={<ProtectedRoutes><UserProfile /></ProtectedRoutes>} />
            </Routes>
        </>
    );
};

export default RoutesConfig;
