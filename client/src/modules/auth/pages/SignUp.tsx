import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BtnLoading from "../../../components/BtnLoading.tsx";
import type { signUpForm } from "../types/userData.ts";
import { useGoogleSignUp, useSignupPassword } from "../hooks/useSignup.ts";

const SignUp: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showErr, setErr] = useState<boolean>(true);
  const [showMsg, setMsg] = useState<string>("");
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [userData, setUserData] = useState<signUpForm>({
    email: "",
    password: "",
    username: "",
  });

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^.{8,}$/;
  const usernameRegex =
    /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;

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

    if (name === "username") {
      if (!usernameRegex.test(value)) {
        setMsg(
          "Username: 3-20 characters, letters, numbers, . or _, no leading/trailing or consecutive ./_."
        );
      } else {
        setMsg("");
      }
    }
  };

  const SignUpwithPassword = async () => {
    if (
      !emailRegex.test(userData.email) ||
      !usernameRegex.test(userData.username) ||
      !passwordRegex.test(userData.password)
    ) {
      setMsg("All fields required!");
      return;
    }
    setLoading(true);
    setErr(true);


    try {
      let signUpUser = await useSignupPassword(
        userData.username,
        userData.email,
        userData.password
      );

      if (signUpUser.success) {
        setMsg(signUpUser.message);
        setErr(false);
      } else {
        setMsg(signUpUser.message);
        setLoading(false);
        setErr(true);
      }

      setMsg(signUpUser.message);
      setLoading(false);
    } catch (error: any) {
      setMsg(error.message);
      setErr(true);
      setLoading(false);
      return;
    }
  };

  const SignUpwithGoogle = async () => {
    try {
      let signUpUser = await useGoogleSignUp();

      if (signUpUser.success) {
        setMsg(signUpUser.message);
        setErr(false);
        navigate("/inbox");
      } else {
        setErr(true);
        setMsg(signUpUser.message);
      }
    } catch (error: any) {
      setErr(true);
      setMsg(error.message);

      return;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 justify-start rounded-lg mx-auto max-w-xl min-w-2xs p-4 my-24">
      <div className="flex flex-col gap-1 justify-center items-center text-center">
        <h2 className="text-2xl font-semibold">SignUp to BableUp!</h2>
        <p className="text-stone-600 text-sm">
          Join BableUp and start connecting instantly
        </p>
      </div>
      <div className="w-full flex flex-col gap-4">
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">alternate_email</span>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Your email address.."
            className="w-full outline-none py-2"
            value={userData.email}
            onChange={handleInput}
            required
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">person</span>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Pick something cool & unique username!"
            value={userData.username}
            onChange={handleInput}
            className="w-full outline-none py-2"
            required
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">password_2</span>
          <input
            type="password"
            name="password"
            ref={passwordRef}
            id="password"
            value={userData.password}
            onChange={handleInput}
            placeholder="Make it strong (8+ characters)"
            className="w-full outline-none py-2"
            required
          />
          <span onClick={togglePassword} className="flex hover:cursor-pointer">
            <span className="material-symbols-outlined">visibility</span>
          </span>
        </span>
        {showMsg.length != 0 ? (
          <div className={`${showErr ? "text-red-500" : "text-green-800"}`}>
            {showMsg}
          </div>
        ) : (
          ""
        )}
        {!isLoading ? (
          <button
            onClick={SignUpwithPassword}
            className="bg-teal-700 rounded-md text-white hover:bg-teal-900 cursor-pointer w-full p-2"
          >
            Get Started
          </button>
        ) : (
          <button
            className="p-2 text-white bg-black w-full rounded-md cursor-not-allowed flex flex-row items-center gap-2 justify-center"
            disabled
          >
            <BtnLoading /> Creating account..
          </button>
        )}
        <p className="text-center">
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
          onClick={SignUpwithGoogle}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
            width={30}
            height={30}
          />
          <p>Continue with Google</p>
        </button>
      </div>
      <div className="text-sm text-center text-stone-600">
        Keep going and you’re agreeing to BableUp’s Terms & Privacy Policy. Your
        info stays secure with us, always.
      </div>
    </div>
  );
};

export default SignUp;
