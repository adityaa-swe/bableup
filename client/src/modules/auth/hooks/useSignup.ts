import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../config/configFirebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { signInWithPopup } from "firebase/auth";

export const useSignupPassword = async (
  username: string,
  email: string,
  password: string
) => {
  if (!username || !email || !password) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  try {
    const userDB = collection(db, "users");

    const searchEmail = query(userDB, where("userMail", "==", email.trim()));
    const searchUsername = query(
      userDB,
      where("profile.username", "==", username.toLowerCase())
    );

    const isEmailExist = await getDocs(searchEmail);
    const isUsernameExist = await getDocs(searchUsername);

    if (!isEmailExist.empty) {
      return {
        success: false,
        message: "This email is already registered.",
      };
    }
    if (!isUsernameExist.empty) {
      return {
        success: false,
        message: "This username is already in use.",
      };
    }

    const createUserInDB = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = createUserInDB.user;

    await sendEmailVerification(firebaseUser, {
      url: `${import.meta.env.VITE_WEB_URL}/auth-mail`,
      handleCodeInApp: true,
    });

    const userIP = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);

    const userDevice = navigator.userAgent;

    await setDoc(doc(db, "users", firebaseUser.uid), {
      userId: firebaseUser.uid,
      userMail: firebaseUser.email,
      isEmailVerified: false,

      profile: {
        username: username.toLowerCase(),
        displayName: username.toLowerCase() || "Unknown User",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
        bio: "",
        fullName: "",
      },

      relations: {
        blocked: [],
      },

      authProviders: {
        provider: ["password"],
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
      message: "Verification email sent, check your inbox.",
      redirectTo: "/inbox",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const useGoogleSignUp = async () => {
  try {
    const createUser = await signInWithPopup(auth, googleProvider);

    if (!createUser) {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }

    const firebaseUser = createUser.user;

    const userDB = collection(db, "users");
    const searchEmail = query(userDB, where("email", "==", firebaseUser.email));
    const isEmailExist = await getDocs(searchEmail);

    if (!isEmailExist.empty) {
      return {
        success: false,
        message: "This email is already registered.",
      };
    }

    const userIP = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);

    const userDevice = navigator.userAgent;

    await setDoc(doc(db, "users", firebaseUser.uid), {
      userId: firebaseUser.uid,
      userMail: firebaseUser.email,
      isEmailVerified: firebaseUser.emailVerified,

      profile: {
        username: firebaseUser.displayName?.toLowerCase(),
        displayName: firebaseUser.displayName?.toLowerCase() || "Unknown User",
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
      message: "Signup successful. Welcome!",
      redirectTo: "/inbox",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
