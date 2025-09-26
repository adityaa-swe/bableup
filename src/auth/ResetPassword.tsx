import React, { useRef, useState } from "react";
import BtnLoader from "../components/BtnLoader";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/config";

const ResetPassword: React.FC = () => {
  interface userType {
    password: string;
  }
  const [userData, setUserData] = useState<userType>({
    password: "",
  });

  const [showMsg, setMsg] = useState<string>("");
  const passwordRegex = /^.{8,}$/;

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

  const passwordRef = useRef<HTMLInputElement | null>(null);
  const cpasswordRef = useRef<HTMLInputElement | null>(null);

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

  const [cPassword, setCPassword] = useState("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleConfirmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCPassword(e.target.value);
  };

  const sendData = async () => {
    setLoading(true);
    try {
      if (
        !passwordRegex.test(userData.password) ||
        userData.password.length < 8
      ) {
        setMsg("All fields are required before continuing.");
        setLoading(false);
        return;
      } else if (cPassword != userData.password) {
        setLoading(false);
        setMsg("Passwords do not match.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get("oobCode") || "";

      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, userData.password);

      setMsg(
        "Password has been reset successfully - u will redirect to Login!"
      );

      setInterval(() => {
        navigate("/login");
      }, 2000);
      return;
    } catch (error: any) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="flex flex-col py-4 px-4 w-[30vw] max-[770px]:w-[70vw] max-sm:w-[90vw] items-center gap-6 justify-start rounded-lg mx-auto mt-24">
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
            Update Password
          </button>
        ) : (
          <button className="flex flex-row justify-center items-center gap-2 cursor-not-allowed bg-stone-800 p-2 rounded-lg text-white">
            <BtnLoader />
            Wait a Minute..
          </button>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
