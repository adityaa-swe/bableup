import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, googleProvider } from "../config/configFirebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { searchProfile } from "./searchProfile";

export const useLogin = async (email: string, password: string) => {
  if (!email && !password) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  try {
    const loginUser = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = loginUser.user;
    await firebaseUser.reload();

    const userDB = collection(db, "users");
    const searchEmail = query(userDB, where("userMail", "==", email));
    const isEmailExist = await getDocs(searchEmail);

    if (!isEmailExist.empty) {
      return {
        success: false,
        message: "Invalid Credientials",
      };
    }

    const userProfile = await searchProfile(firebaseUser.uid);

    if (!userProfile.userData?.isEmailVerified) {
      await sendEmailVerification(firebaseUser, {
        url: `${import.meta.env.VITE_WEB_URL}/auth-mail`,
        handleCodeInApp: true,
      });

      return {
        success: false,
        message: "Verification email sent, check your inbox.",
      };
    }
    const userIP = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);

    const userRef = doc(db, "users", firebaseUser.uid);

    await updateDoc(userRef, {
      "security.lastLoginIP": userIP,
      "timeStamps.lastSeen": serverTimestamp(),
    });

    return {
      success: true,
      message: "SignIn successful!",
      redirectTo: "/inbox",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const useGoogleLogin = async () => {
  try {
    const loginUser = await signInWithPopup(auth, googleProvider);
    const firebaseUser = loginUser.user;
    const userDevice = navigator.userAgent;

    if (!loginUser) {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }

    const userIP = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);

    const userRef = doc(db, "users", firebaseUser.uid);
    const snapShot = await getDoc(userRef);
    if (snapShot.exists()) {
      await updateDoc(userRef, {
        "security.lastLoginIP": userIP,
        "timeStamps.lastSeen": serverTimestamp(),
      });
      return {
        success: true,
        message: "SignIn Successful!",
      };
    } else {
      await setDoc(doc(db, "users", firebaseUser.uid), {
        userId: firebaseUser.uid,
        userMail: firebaseUser.email,
        isEmailVerified: firebaseUser.emailVerified,

        profile: {
          username: firebaseUser.displayName?.toLowerCase(),
          displayName:
            firebaseUser.displayName?.toLowerCase() || "Unknown User",
          imageUrl: firebaseUser.photoURL,
          bio: "",
          fullName: "",
        },

        relations: {
          blocked: [],
        },

        authProviders: {
          provider: firebaseUser.providerData[0].providerId,
          linkedAt: serverTimestamp(),
        },

        settings: {
          preferences: {
            darkMode: false,
          },
        },

        timeStamps: {
          createdAt: serverTimestamp(),
          updatedAt: null,
          lastSeen: null,
        },

        security: {
          signUpIP: userIP || null,
          lastLoginIP: null,
          userDevice: userDevice || null,
          webVersion: import.meta.env.WEB_VERSION || "1.0",
        },
      });
      return {
        success: true,
        message: "SignIn successful",
        redirectTo: "/inbox",
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
