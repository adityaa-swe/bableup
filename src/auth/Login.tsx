import React, { useRef, useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { auth, googleProvider } from "../services/config.ts";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import BtnLoader from "../components/BtnLoader.tsx";

const Login: React.FC = () => {
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
  }

  const [userData, setUserData] = useState<LoginType>({
    email: "",
    password: "",
  });

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^.{8,}$/;

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
  };

  const [showMsg, setMsg] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const sendData = async () => {
    setLoading(true);
    try {
      if (
        !emailRegex.test(userData.email) ||
        !userData.password ||
        userData.password.length < 8
      ) {
        setMsg("All fields are required before continuing.");
        setLoading(false);
        return;
      }

      const userInfo = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const user = userInfo.user;

      if (!user.emailVerified) {
        setMsg("Email is not verified!");
        setLoading(false);
        return null;
      }

      console.log(user);

      navigate("/dashboard");
    } catch (error: any) {
      setLoading(false);
      setMsg(error.message);
      return;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result) {
        setMsg("Something went wrong!");
        return;
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
        <h2 className="text-2xl font-medium">Welcome Back!</h2>
        <p className="text-stone-500">Jump back into the conversation.</p>
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
          <LockOpenIcon />
          <input
            type="text"
            ref={passwordRef}
            name="password"
            id="password"
            placeholder="Your Password...."
            className="w-full outline-none"
            value={userData.password}
            onChange={handleInput}
          />
          <span onClick={togglePassword}>
            <VisibilityIcon className="hover:cursor-pointer" />
          </span>
        </span>
        <Link
          to="/forgot-password"
          className="text-[15px] underline hover:text-blue-900"
        >
          Forgot Password ?
        </Link>
        {showMsg.length == 0 ? (
          ""
        ) : (
          <div id="message-wrapper" className="text-red-600">
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
            Wait a Minute..
          </button>
        )}
        <p className="text-center text-[15px]">
          Don't have an account ?{" "}
          <Link to="/signup" className="hover:underline text-blue-900">
            SignUp
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
          onClick={handleGoogleLogin}
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

export default Login;
