import { applyActionCode } from "firebase/auth";
import React, { useEffect } from "react";
import { auth, db } from "../services/config";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

const AuthEmail: React.FC = () => {
  useEffect(() => {
    const authMail = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      if (mode === "verifyEmail" && oobCode) {
        try {
          await applyActionCode(auth, oobCode);
          await auth.currentUser?.reload();

          if (auth.currentUser?.emailVerified) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
              emailVerified: true,
              updatedAt: serverTimestamp(),
            });
            setInterval(() => {
              window.location.href = "/sucess";
            }, 4000);
          }
        } catch (error) {
          console.log("Verification Failed", error);
        }
      }
    };

    authMail();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center gap-5 mt-24">
         <div id="loader" className="w-12 animate-spin border-blue-900 rounded-full flex border-t-transparent h-12 border-4"></div>
         <h1>Authorizing Your Email....</h1>
    </div>
  )
};

export default AuthEmail;
