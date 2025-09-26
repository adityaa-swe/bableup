import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../services/config.ts";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import BtnLoader from "../components/BtnLoader.tsx";

const SignUp: React.FC = () => {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const togglePassword = () => {
    if (passwordRef.current) {
      if (passwordRef.current.type == "password") {
        passwordRef.current.type = "text";
      } else {
        passwordRef.current.type = "password";
      }
    }
  };

  interface LoginType {
    email: string;
    password: string;
    username: string;
  }

  const [userData, setUserData] = useState<LoginType>({
    email: "",
    password: "",
    username: "",
  });

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^.{8,}$/;
  const usernameRegex =
    /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "email") {
      if (!emailRegex.test(value)) {
        setMsg("Enter a valid email address (example: name@domain.com)");
      } else {
        setMsg("");
      }
    }
    if (name === "password") {
      if (!passwordRegex.test(value)) {
        setMsg("Password must be at least 8 characters.");
      } else {
        setMsg("");
      }
    }

    if (name === "username") {
      if (!usernameRegex.test(value)) {
        setMsg(
          "Username: 3–20 characters, letters, numbers, . or _, no leading/trailing or consecutive ./_."
        );
      } else {
        setMsg("");
      }
    }
  };

  const [isLoading, setLoading] = useState<boolean>(false);

  const [showMsg, setMsg] = useState<string>("");

  const useNavigation = useNavigate();

  const webVersion = String(import.meta.env.VITE_WEBVERSION) || null;

  const navigate = useNavigate();
  const userDevice = navigator.userAgent;

  const sendData = async () => {
    try {
      setLoading(true);
      if (
        !emailRegex.test(userData.email) ||
        !userData.password ||
        userData.password.length < 8 ||
        !userData.username ||
        !usernameRegex.test(userData.username)
      ) {
        setMsg("All fields are required before continuing.");
        setLoading(false);
        return;
      }

      const userCollection = collection(db, "users");

      const ip = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip);

      const emailQuery = query(
        userCollection,
        where("email", "==", userData.email)
      );
      const usernameQuery = query(
        userCollection,
        where("username", "==", userData.username)
      );

      const isEmailExist = await getDocs(emailQuery);
      const isUsernameExist = await getDocs(usernameQuery);

      if (!isEmailExist.empty) {
        setMsg("Email already exists!");
        setLoading(false);
        return;
      } else if (!isUsernameExist.empty) {
        setMsg("Username already in use!");
        setLoading(false);
        return;
      }

      const signUpUser = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const userInfo = signUpUser.user;

      await sendEmailVerification(userInfo, {
        url: "http://localhost:5173/auth-mail",
        handleCodeInApp: true,
      });

      await setDoc(doc(db, "users", userInfo.uid), {
        uid: userInfo.uid,
        email: userData.email,
        emailVerified: false,

        profile: {
          username: userData.username,
          displayName: userData.username.toLocaleLowerCase() || null,
          photoUrl: "",
          bio: "",
          fullName: "",
        },

        relations: {
          friends: [],
          blocked: [],
        },

        authProviders: {
          provider: ["password"],
          linkedAt: new Date(),
        },

        settings: {
          preferences: {
            darkMode: false,
            language: "en-us",
          },
          notifications: {
            enabled: false,
            push: false,
          },
          privacy: {
            showStatus: true,
          },
        },

        timeStamps: {
          createdAt: new Date(),
          updatedAt: null,
          lastSeen: null,
        },

        security: {
          signUpIP: ip || null,
          lastLoginIP: null,
          userDevice: userDevice || null,
          webVersion: webVersion || null,
        },
      });

      useNavigation(`/mail-message`, {
        state: { email: userData.email },
      });
    } catch (error: any) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userInfo = result.user;

      const userCollection = collection(db, "users");

      const emailQuery = query(
        userCollection,
        where("email", "==", userData.email)
      );

      const isEmailExist = await getDocs(emailQuery);

      if (!isEmailExist.empty) {
        setMsg("Email already exist");
      }

      const ip = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip);

      await setDoc(doc(db, "users", userInfo.uid), {
        uid: userInfo.uid,
        email: userInfo.email,
        emailVerified: userInfo.emailVerified,

        profile: {
          username: userInfo.displayName?.toLocaleLowerCase(),
          displayName: userInfo.displayName?.toLowerCase() || null,
          photoUrl: userInfo.photoURL,
          bio: "",
          fullName: "",
        },

        relations: {
          friends: [],
          blocked: [],
        },

        authProviders: {
          provider: userInfo.providerId,
          linkedAt: new Date(),
        },

        settings: {
          preferences: {
            darkMode: false,
            language: "en-us",
          },
          notifications: {
            enabled: false,
            push: false,
          },
          privacy: {
            showStatus: true,
          },
        },

        timeStamps: {
          createdAt: new Date(),
          updatedAt: null,
          lastSeen: null,
        },

        security: {
          signUpIP: ip || null,
          lastLoginIP: null,
          userDevice: userDevice || null,
          webVersion: webVersion || null,
        },
      });

      navigate("/app/inbox");
      return;
    } catch (error: any) {
      setMsg(error.message);
      return;
    }
  };

  return (
    <div className="flex flex-col py-4 px-4 w-[30vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center gap-6 justify-start rounded-lg mx-auto mt-24">
      <div
        id="head"
        className="flex flex-col gap-1 justify-center items-center text-center"
      >
        <h2 className="text-2xl font-semibold">SignUp to BableUp!</h2>
        <p className="text-stone-500">
          Create your account and start connecting instantly.
        </p>
      </div>
      <div id="wrapper" className="w-full flex flex-col gap-4">
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">alternate_email</span>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Your Email...."
            className="w-full outline-none py-2"
            value={userData.email}
            onChange={handleInput}
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">person</span>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Your Username...."
            value={userData.username}
            onChange={handleInput}
            className="w-full outline-none py-2"
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">password_2</span>
          <input
            type="text"
            name="password"
            ref={passwordRef}
            id="password"
            value={userData.password}
            onChange={handleInput}
            placeholder="Your Password...."
            className="w-full outline-none py-2"
          />
          <span onClick={togglePassword} className="flex">
            <span className="material-symbols-outlined">visibility</span>
          </span>
        </span>
        {showMsg.length == 0 ? (
          ""
        ) : (
          <div id="msg-wrapper" className="text-red-500">
            {showMsg}
          </div>
        )}
        {!isLoading ? (
          <button
            className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-700 cursor-pointer transition-all"
            onClick={sendData}
          >
            Get Started
          </button>
        ) : (
          <button className="flex flex-row justify-center items-center gap-2 cursor-not-allowed bg-stone-800 p-2 rounded-lg text-white">
            <BtnLoader />
            Creating account..
          </button>
        )}

        <p className="text-center text-[15px]">
          Have an account with BableUp ?{" "}
          <Link to="/login" className="hover:underline text-teal-700">
            Login
          </Link>
        </p>
      </div>
      <div
        id="divider"
        className="flex flex-row w-full items-center gap-2 text-stone-500"
      >
        <hr className="border border-stone-200 w-full" />
        <p>OR</p>
        <hr className="border border-stone-200 w-full" />
      </div>
      <div
        id="auth-wrapper"
        className="w-full flex flex-row gap-2 justify-center items-center"
      >
        <button
          className="cursor-pointer rounded-lg border border-stone-200 hover:bg-stone-200 p-2 flex flex-row gap-2 w-full justify-center items-center"
          onClick={handleGoogleSignUp}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
            width={30}
            height={30}
          />
          <p>Continue with Google</p>
        </button>
      </div>
      <div id="terms" className="text-sm text-center text-stone-500">
        By continuing to use our services, you acknowledge that you have both
        read and agree to our{" "}
        <Link to="/terms" className="underline hover:text-teal-700">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy-policy" className="underline hover:text-teal-700">
          Privacy Policy.
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
