import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { forgotPassword } from "../types/userData";
import { useForgot } from "../hooks/authMail";
import BtnLoading from "../../../components/BtnLoading";

const ForgotPassword: React.FC = () => {
  const [userData, setUserData] = useState<forgotPassword>({
    email: "",
  });
  const [showMsg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showErr, setErr] = useState<boolean>(true);
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

  const forgotPassword = async () => {
    setLoading(true);
    try {
      let forgotUser = await useForgot(userData.email);

      if (forgotUser.success) {
        setMsg(forgotUser.message);
        setErr(false);
      } else {
        setErr(true);
        setMsg(forgotUser.message);
      }

      setLoading(false);
    } catch (error: any) {
      setMsg(error.message);
      setErr(true);
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6 max-w-xl min-w-2xs p-4 my-24 justify-start rounded-lg mx-auto">
        <div
          id="head"
          className="flex flex-col gap-1 justify-center items-center text-center"
        >
          <h2 className="text-2xl font-medium">Oops, Forgot Your Password?</h2>
          <p className="text-stone-600 text-sm">
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
              placeholder="Your Registered Email.."
              className="w-full outline-none py-2"
            />
          </span>
          {showMsg.length != 0 ? (
            <div className={`${showErr ? "text-red-500" : "text-green-700"}`}>
              {showMsg}
            </div>
          ) : (
            ""
          )}
          {!loading ? (
            <button
              className="p-2 w-full text-white bg-teal-700 text-center rounded-md cursor-pointer hover:bg-teal-900"
              onClick={forgotPassword}
            >
              Continue
            </button>
          ) : (
            <button
              className="bg-black text-white p-2 w-full flex flex-row items-center justify-center gap-2 rounded-md cursor-not-allowed"
              disabled
            >
              <BtnLoading /> Wait a Minute..
            </button>
          )}
          <p className="text-center text-[15px]">
            Don't have an account ?{" "}
            <Link to="/" className="hover:underline text-teal-700">
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
