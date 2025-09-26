import { applyActionCode } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../services/config";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BableUp } from "../context/AuthContext";

const AuthEmail: React.FC = () => {
  const navigate = useNavigate();
  const [globalMsg, setGlobalMsg] = useState<string>(
    "Fetching your details..."
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { firebaseUser } = BableUp();

  useEffect(() => {
    const authMail = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      if (mode === "verifyEmail" && oobCode) {
        try {
          setGlobalMsg("Processing verification...");
          await applyActionCode(auth, oobCode);
          await firebaseUser?.reload();

          if (firebaseUser) {
            const userRef = doc(db, "users", firebaseUser?.uid);
            await updateDoc(userRef, {
              emailVerified: true,
              updatedAt: new Date().toDateString(),
            });

            setGlobalMsg("Authorization successful! Redirecting to Inbox...");

            setTimeout(() => {
              navigate("/app/inbox");
            }, 3000);
          }
        } catch (error: any) {
          setLoading(false);
          setGlobalMsg(error.message || "Something went wrong!");
        }
      } else {
        setLoading(false);
        setGlobalMsg("Something went wrong, Please Login then try again!");
      }
    };

    authMail();
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center my-24 gap-6 p-4">
      <div className="flex flex-col items-center gap-4">
        {loading && (
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        )}
        <p className="text-center text-stone-500 font-medium text-lg">
          {globalMsg}
        </p>
      </div>
    </div>
  );
};

export default AuthEmail;
