import React, { useRef, useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import { auth, googleProvider, db } from "../services/config.ts";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
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
        url: "http://localhost:5173/authorize-email",
        handleCodeInApp: true,
      });
      console.log(userInfo);

      await setDoc(doc(db, "users", userInfo.uid), {
        uid: userInfo.uid,
        username: userData.username,
        email: userData.email,
        avatar: null,
        bio: null,
        emailVerified: false,
        providers: ["password"],
        blockedUsers: [],
        friends: [],
        status: "offline",
        lastSeen: null,
        createdAt: serverTimestamp(),
        updatedAt: null,
        settings: {
          darkMode: false,
          language: "en",
        },
        metadata: {
          lastLoginIP: "",
          signUpIP: ip,
          device: userDevice,
          webVersion: webVersion,
        },
      });

      useNavigation("/message", { state: { email: userData.email } });
    } catch (error: any) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
  };

  const navigate = useNavigate();
  const userDevice = navigator.userAgent;

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userInfo = result.user;

      const userRef = doc(db, "users", userInfo.uid);
      const isEmailExist = await getDoc(userRef);

      const ip = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip);

      if (!isEmailExist.exists()) {
        await setDoc(userRef, {
          uid: userInfo.uid,
          username: userData.username,
          email: userData.email,
          avatar: null,
          bio: null,
          isVerified: false,
          providers: ["google.com"],
          blockedUsers: [],
          friends: [],
          status: "offline",
          lastSeen: null,
          createdAt: serverTimestamp(),
          updatedAt: null,
          settings: {
            darkMode: false,
            language: "en",
          },
          metadata: {
            lastLoginIP: "",
            signUpIP: ip,
            device: userDevice,
            webVersion: webVersion,
          },
        });
      }

      navigate("/dashboard");
    } catch (error: any) {
      setMsg(error.message);
    }
  };

  return (
    <div className="flex flex-col py-4 px-4 w-[30vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center gap-6 justify-start rounded-lg mx-auto mt-24">
      <div
        id="head"
        className="flex flex-col gap-1 justify-center items-center text-center"
      >
        <h2 className="text-2xl font-medium">SignUp to BableUp!</h2>
        <p className="text-stone-500">
          Create your account and start connecting instantly.
        </p>
      </div>
      <div id="wrapper" className="w-full flex flex-col gap-4">
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 py-2 px-2">
          <MailOutlineIcon />
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Your Email...."
            className="w-full outline-none"
            value={userData.email}
            onChange={handleInput}
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 py-2 px-2">
          <AlternateEmailIcon />
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Your Username...."
            value={userData.username}
            onChange={handleInput}
            className="w-full outline-none"
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 py-2 px-2">
          <LockOpenIcon />
          <input
            type="text"
            name="password"
            ref={passwordRef}
            id="password"
            value={userData.password}
            onChange={handleInput}
            placeholder="Your Password...."
            className="w-full outline-none"
          />
          <span onClick={togglePassword}>
            <VisibilityIcon className="hover:cursor-pointer" />
          </span>
        </span>
        {showMsg.length == 0 ? (
          ""
        ) : (
          <div id="msg-wrapper" className="text-red-500 text-[15px]">
            {showMsg}
          </div>
        )}
        {!isLoading ? (
          <button
            className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-950 cursor-pointer transition-all"
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
          <Link to="/login" className="hover:underline text-blue-900">
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
          className="cursor-pointer rounded-lg bg-white border border-stone-200 hover:bg-stone-200 p-2 flex flex-row gap-2 w-full justify-center items-center"
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
      <div
        id="terms"
        className="text-[13px] text-center font-semibold text-stone-500"
      >
        By continuing to use our services, you acknowledge that you have both
        read and agree to our{" "}
        <Link to="" className="underline hover:text-blue-900">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="" className="underline hover:text-blue-900">
          Privacy Policy.
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
