import React, { useEffect, useState } from "react";
import { useEmail } from "../hooks/authMail";
import { auth } from "../config/configFirebase";
import Loading from "../../../components/Loading";
import { useNavigate } from "react-router-dom";

const EmailVerification: React.FC = () => {
  const [showMsg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");
    const userId = auth.currentUser?.uid;
    const authUser = async () => {
      if (!oobCode || !userId || !mode) {
        return;
      }

      await authorizeEmail(oobCode, userId, mode);
    };

    authUser();
  }, []);

  const authorizeEmail = async (
    oobCode: string,
    userId: string,
    mode: string
  ) => {
    setLoading(true);

    try {
      if (!oobCode || !userId || !mode) {
        setMsg("Unauthorized Access");
        navigate("/login");
        return;
      }
      let authUser = await useEmail(mode, oobCode, userId);
      if (authUser.success) {
        setMsg(authUser.message);
        setLoading(true);
        setTimeout(() => {
          navigate("/inbox");
        }, 3000);
      } else {
        setMsg(authUser.message);
        setLoading(false);
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setMsg(error.message);
      return;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center my-24 gap-6 p-4">
      <div className="flex flex-col items-center gap-4">
        {loading && <Loading />}
        <p className="text-center font-medium text-lg">{showMsg}</p>
      </div>
    </div>
  );
};

export default EmailVerification;
