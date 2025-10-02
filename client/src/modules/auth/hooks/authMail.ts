import {
  applyActionCode,
  confirmPasswordReset,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth, db } from "../config/configFirebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export const useEmail = async (
  mode: string,
  oobCode: string,
  userId: string
) => {
  if (!mode && !oobCode && !userId) {
    return {
      success: false,
      message: "Invalid Credientials!",
    };
  }
  try {
    await applyActionCode(auth, oobCode);
    if (userId) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isEmailVerified: true,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: "Email Verification Successful!",
        redirectTo: "/inbox",
      };
    }

    return {
      success: false,
      message: "Something went wrong, try to login again!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const usePassword = async (password: string, oobCode: string) => {
  if (!oobCode && !password) {
    return {
      success: false,
      message: "Invalid Credientials!",
    };
  }

  try {
    await verifyPasswordResetCode(auth, oobCode);
    await confirmPasswordReset(auth, oobCode, password);

    return {
      success: true,
      message: "Password has been changed, You can login now!",
      redirectTo: "/login",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const useForgot = async (email: string) => {
  if (!email) {
    return {
      success: false,
      message: "Email is required!",
    };
  }

  try {
    const providers = await fetchSignInMethodsForEmail(auth, email);

    if (providers.includes("google.com")) {
      return {
        success: false,
        message: "Email is associated with google account!",
      };
    }

    await sendPasswordResetEmail(auth, email, {
      url: `${import.meta.env.VITE_WEB_URL}/reset-password`,
      handleCodeInApp: true,
    });

    return {
      success: true,
      message: "Verification email has sent, check your inbox.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
