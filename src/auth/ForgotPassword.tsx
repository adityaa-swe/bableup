import React, { useState } from "react";
import { Link } from "react-router-dom";
import BtnLoader from "../components/BtnLoader";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../services/config";

const ForgotPassword: React.FC = () => {
  interface userType {
    email: string;
  }
  const [userData, setUserData] = useState<userType>({
    email: "",
  });

  const [showMsg, setMsg] = useState<string>("");
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

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
  };

  const [isLoading, setLoading] = useState<boolean>(false);

  const sendData = async () => {
    setLoading(true);
    try {
      if (!emailRegex.test(userData.email)) {
        setMsg("All fields are required before continuing.");
        setLoading(false);
        return;
      }

      const providers = await fetchSignInMethodsForEmail(auth, userData.email);

      if (providers.includes("google.com")) {
        setMsg(
          "This email is registered via Google login. Use Google login instead."
        );
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, userData.email, {
        url: "http://localhost:5173/reset-password",
        handleCodeInApp: true,
      });

      setMsg("Email has been sent, Checkout your inbox!");
      setLoading(true);
      return;
    } catch (error: any) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col py-4 px-4 w-[30vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center gap-6 justify-start rounded-lg mx-auto mt-24">
        <div
          id="head"
          className="flex flex-col gap-1 justify-center items-center text-center"
        >
          <h2 className="text-2xl font-medium">Oops, Forgot Your Password?</h2>
          <p className="text-stone-500">
            Happens to the best of us - let’s get you back to chatting!
          </p>
        </div>
        <div id="wrapper" className="w-full flex flex-col gap-4">
          <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
            <span className="material-symbols-outlined">alternate_email</span>
            <input
              type="text"
              name="email"
              value={userData.email}
              onChange={handleInput}
              id="email"
              placeholder="Your Registered Email...."
              className="w-full outline-none py-2"
            />
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
              Continue
            </button>
          ) : (
            <button className="flex flex-row justify-center items-center gap-2 cursor-not-allowed bg-teal-900 p-2 rounded-lg text-white">
              <BtnLoader />
              Wait a Minute!
            </button>
          )}
          <p className="text-center text-[15px]">
            Don't have an account ?{" "}
            <Link to="/signup" className="hover:underline text-teal-700">
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
