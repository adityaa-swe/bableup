import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { loginForm } from "../types/userData.ts";
import { useGoogleLogin, useLogin } from "../hooks/useLogin.ts";
import BtnLoading from "../../../components/BtnLoading.tsx";

const Login: React.FC = () => {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<loginForm>({
    email: "",
    password: "",
  });
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^.{8,}$/;
  const [showMsg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showErr, setErr] = useState<boolean>(true);

  const togglePassword = () => {
    if (passwordRef.current) {
      if (passwordRef.current.type == "password") {
        passwordRef.current.type = "text";
      } else {
        passwordRef.current.type = "password";
      }
    }
  };

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

  const loginWithPassword = async () => {
    if (
      !emailRegex.test(userData.email) ||
      !passwordRegex.test(userData.password)
    ) {
      setMsg("All fields required!");
      return;
    }
    setLoading(true);
    try {
      const loginUser = await useLogin(userData.email, userData.password);

      if (loginUser.success) {
        setErr(false);
        setMsg(loginUser.message);
        navigate("/inbox");
        return;
      } else {
        setErr(true);
        setMsg(loginUser.message);
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setMsg(error.message);
      setErr(true);
      return;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const loginUser = await useGoogleLogin();
      if (loginUser.success) {
        setErr(false);
        setMsg(loginUser.message);
        navigate("/inbox");
      } else {
        setErr(true);
        setMsg(loginUser.message);
      }
    } catch (error: any) {
      setErr(true);
      setMsg(error.message);
    }
  };

  return (
    <div className="flex flex-col max-w-xl min-w-2xs p-4 my-24 items-center gap-6 justify-start rounded-lg mx-auto mt-24">
      <div
        id="head"
        className="flex flex-col gap-1 justify-center items-center text-center"
      >
        <h2 className="text-2xl font-semibold">Welcome Back!</h2>
        <p className="text-stone-600 text-sm">
          Jump back into the conversation.
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
        <span className="flex flex-row px-2 items-center border border-stone-200 rounded-lg gap-2">
          <span className="material-symbols-outlined">password_2</span>
          <input
            type="text"
            ref={passwordRef}
            name="password"
            id="password"
            placeholder="Your Password...."
            className="w-full outline-none py-2"
            value={userData.password}
            onChange={handleInput}
          />
          <span className="flex cursor-pointer" onClick={togglePassword}>
            <span className="material-symbols-outlined">visibility</span>
          </span>
        </span>
        <Link to="/forgot-password" className="inline-block hover:underline">
          Forgot Password ?
        </Link>
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
            onClick={loginWithPassword}
          >
            Login Me
          </button>
        ) : (
          <button
            className="bg-black text-white p-2 w-full flex flex-row items-center justify-center gap-2 rounded-md cursor-not-allowed"
            disabled
          >
            <BtnLoading /> Wait a Minute..
          </button>
        )}
        <p className="text-center">
          Don't have an account ?{" "}
          <Link to="/" className="hover:underline text-teal-700">
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
          className="cursor-pointer rounded-lg border border-stone-200 hover:bg-stone-200 p-2 flex flex-row gap-2 w-full justify-center items-center"
          onClick={loginWithGoogle}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
            width={30}
            height={30}
          />
          <p>Continue with Google</p>
        </button>
      </div>
    </div>
  );
};

export default Login;
