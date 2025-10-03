import React, { useEffect, useRef, useState } from "react";
import type { resetPassword } from "../types/userData.ts";
import { usePassword } from "../hooks/authMail.ts";
import BtnLoading from "../../../components/BtnLoading.tsx";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [userData, setUserData] = useState<resetPassword>({
    password: "",
  });

  const [showMsg, setMsg] = useState<string>("");
  const passwordRegex = /^.{8,}$/;
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const cpasswordRef = useRef<HTMLInputElement | null>(null);
  const [cPassword, setCPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showErr, setErr] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "password") {
      if (!passwordRegex.test(value)) {
        setMsg("Password must be at least 8 characters.");
      } else {
        setMsg("");
      }
    }
  };

  const togglePassword = () => {
    if (passwordRef.current && cpasswordRef.current) {
      if (
        passwordRef.current.type == "password" ||
        cpasswordRef.current.type == "password"
      ) {
        passwordRef.current.type = "text";
        cpasswordRef.current.type = "text";
      } else {
        passwordRef.current.type = "password";
        cpasswordRef.current.type = "password";
      }
    }
  };

  const handleConfirmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCPassword(e.target.value);
  };

  useEffect(() => {
    let searchParams = new URLSearchParams(window.location.search);
    let oobCode = searchParams.get("oobCode");
    if (!oobCode) {
      navigate("/login");
      return;
    }
  }, []);

  const userResetPassword = async () => {
    if (cPassword !== userData.password) {
      setMsg("Both password does not matching!");
      return;
    }

    setLoading(true);
    try {
      let searchParams = new URLSearchParams(window.location.search);
      let oobCode = searchParams.get("oobCode");
      if (!oobCode) {
        setMsg("Unauthorized Access");
        setLoading(false);
        return;
      }

      let resetUser = await usePassword(userData.password, oobCode);

      if (resetUser.success) {
        setMsg(resetUser.message);
        setErr(false);
        navigate("/inbox");
      } else {
        setMsg(resetUser.message);
        setErr(true);
      }

      setLoading(false);
    } catch (error: any) {
      setMsg(error.message);
      setErr(true);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="flex flex-col p-4 max-w-xl min-w-xs items-center gap-6 justify-start rounded-lg mx-auto mt-24">
      <div
        id="head"
        className="flex flex-col gap-1 justify-center items-center text-center"
      >
        <h2 className="text-2xl font-medium">Time for a Fresh Start!</h2>
        <p className="text-stone-500">
          A new password, a safer chat - let’s lock it in!
        </p>
      </div>
      <div id="wrapper" className="w-full flex flex-col gap-4">
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">password_2</span>
          <input
            ref={passwordRef}
            type="password"
            name="password"
            id="password"
            placeholder="Your New Password...."
            className="w-full outline-none py-2"
            value={userData.password}
            onChange={handleInput}
          />
        </span>
        <span className="flex flex-row items-center border border-stone-200 rounded-lg gap-2 px-2">
          <span className="material-symbols-outlined">password_2</span>
          <input
            type="password"
            ref={cpasswordRef}
            name="cpassword"
            id="cpassword"
            value={cPassword}
            onChange={handleConfirmInput}
            placeholder="Confirm Password...."
            className="w-full outline-none py-2"
          />
        </span>
        <span
          id="toggle"
          className="flex flex-row gap-2 w-fit"
          onClick={togglePassword}
        >
          <input type="checkbox" id="tog-password" onChange={togglePassword} />
          <label htmlFor="tog-password" className="cursor-pointer">
            Show Password
          </label>
        </span>
        {showMsg.length != 0 ? (
          <div className={`${showErr ? "text-red-500" : "text-green-800"}`}>
            {showMsg}
          </div>
        ) : (
          ""
        )}
        {!loading ? (
          <button
            onClick={userResetPassword}
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
      </div>
    </div>
  );
};

export default ResetPassword;
