import React, { useEffect, useState } from "react";
import { useUpload, useUploadImage } from "../hooks/useUpload";
import BtnLoading from "../../../components/BtnLoading";
import {
  removeBlockUser,
  useDeleteImage,
  useUpdateData,
} from "../hooks/useUpdate";
import type { updateProfile } from "../types/userProfile";
import { useUserStore } from "../../auth/store/useUserStore";
import Loading from "../../../components/Loading";
import { signOut } from "firebase/auth";
import { auth } from "../../auth/config/configFirebase";
import { useForgot } from "../../auth/hooks/authMail";

const UserProfile: React.FC = () => {
  const [showMsg, setMsg] = useState<string>("");
  const [showProfileMsg, setProfileMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [remLoading, setRemLoading] = useState<boolean>(false);
  const { custom } = useUserStore();
  const usernameRegex =
    /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  const userId = custom?.userId;
  const [userData, setUserData] = useState<updateProfile>({
    fullName: "",
    userMail: "",
    imageUrl: "",
    username: "",
    createdAt: new Date(),
    lastSeen: new Date(),
    bio: "",
    displayName: "",
    blocked: [],
    userId: "",
  });
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    setPageLoading(true);
    if (custom) {
      setUserData({
        fullName: custom?.profile.fullName || "",
        userMail: custom?.userMail || "",
        username: custom?.profile.username || "",
        createdAt: custom.timeStamps.createdAt || new Date(),
        lastSeen: custom?.timeStamps.lastSeen || new Date(),
        bio: custom?.profile.bio || "",
        displayName: custom?.profile.displayName || "",
        blocked: custom?.relations?.blocked || [],
        imageUrl: custom.profile.imageUrl,
        userId: custom.userId,
      });
      setPageLoading(false);
    }
  }, [custom]);

  const fileUploadCloud = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgLoading(true);
    setMsg("");

    try {
      let uploadFile = useUpload(e);

      if (!uploadFile.success) {
        setMsg(uploadFile.message);
        setImgLoading(false);
        return;
      }

      if (!uploadFile.image) {
        setMsg(uploadFile.message);
        setImgLoading(false);
        return;
      }

      const uploadFileToCloud = await useUploadImage(
        uploadFile.image,
        userData.userId
      );

      if (!uploadFileToCloud.success) {
        setMsg(uploadFileToCloud.message);
        setImgLoading(false);
        return;
      }

      setImgLoading(false);
      setMsg(uploadFileToCloud.message);
    } catch (error: any) {
      setMsg(error.message);
      setImgLoading(false);
    }
  };

  const removeImage = async () => {
    setRemLoading(true);
    try {
      let removeUserImg = await useDeleteImage(userData.userId);

      if (!removeUserImg.success) {
        setMsg(removeUserImg.message);
        setRemLoading(false);
      }

      setMsg(removeUserImg.message);
      setRemLoading(false);
      return;
    } catch (error: any) {
      setMsg(error.message);
      setRemLoading(false);
      return;
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProfile = async () => {
    if (!userData) {
      setMsg("All fields are required");
      return;
    }

    if (!usernameRegex.test(userData.username)) {
      setMsg("Invalid username!");
      return;
    }
    setLoading(true);
    try {
      const updateUser = await useUpdateData(
        userData.fullName,
        userData.username,
        userData.displayName,
        userData.bio,
        userData.userId
      );

      if (!updateUser.success) {
        setProfileMsg(updateUser.message);
        setLoading(false);
        return;
      }

      setProfileMsg(updateUser.message);
      setLoading(false);
      return;
    } catch (error: any) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
  };

  const unblockUser = async (userId: string, otherUserId: string) => {
    if (!userId || !otherUserId) {
      return false;
    }
    try {
      const unblockId = await removeBlockUser(userId!, otherUserId);

      if (!unblockId.success) {
        return false;
      }

      alert("Blocked User has been unblocked!");
      window.location.reload();
      return;
    } catch (error) {
      return error;
    }
  };

  const logoutUser = () => {
    if (!userId) {
      return;
    } else {
      signOut(auth);
    }
  };

  const changePassword = async () => {
    if (!userData.userMail) {
      return;
    }

    let confirmation = confirm("Are u sure to change password ?");
    if (!confirmation) {
      return;
    }

    try {
      let sendEmail = await useForgot(userData.userMail);

      if (sendEmail.success) {
        setProfileMsg(sendEmail.message);
        return;
      }

      setProfileMsg(sendEmail.message);
    } catch (err: any) {
      setProfileMsg(err.message);
      return;
    }
  };

  return (
    <>
      {pageLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-row mx-auto p-4 gap-8 max-[800px]:flex-col">
          <div id="left-image" className="flex flex-col gap-4 max-w-xl">
            <div
              id="wrapper"
              className="flex flex-col justify-center items-center gap-4 rounded-md text-center"
            >
              <span>
                <img
                  src={
                    userData.imageUrl || "https://avatar.iran.liara.run/public"
                  }
                  alt="profile_image"
                  className="w-52 h-52 rounded-full object-cover"
                />
              </span>
              <p className="text-sm text-stone-500">
                Please upload an image no larger than 500x500 pixels and keep
                the file size low 2MB.
              </p>
              {showMsg && <p className="text-red-500">{showMsg}</p>}
            </div>
            <div
              id="btns"
              className="flex flex-col justify-center items-center gap-2 text-center max-[1100px]:flex-col"
            >
              {imgLoading ? (
                <button className="cursor-not-allowed p-2 bg-black text-white w-full rounded-md flex items-center justify-center gap-2 text-nowrap">
                  <BtnLoading />
                  Wait a sec..
                </button>
              ) : (
                <label
                  htmlFor="upload"
                  className="w-full flex items-center justify-center gap-1 bg-teal-700 p-2 text-white rounded-md hover:bg-teal-900 cursor-pointer text-nowrap"
                >
                  <span className="material-symbols-outlined">upload</span>
                  Upload File
                  <input
                    type="file"
                    onChange={fileUploadCloud}
                    name="upload"
                    accept="image/*"
                    id="upload"
                    style={{ display: "none" }}
                  />
                </label>
              )}
              {remLoading ? (
                <button className="bg-black w-full p-2 text-white rounded-md flex items-center justify-center gap-2 cursor-not-allowed text-nowrap">
                  <BtnLoading />
                  Wait a sec..
                </button>
              ) : (
                <button
                  onClick={removeImage}
                  className="bg-black w-full p-2 text-white rounded-md hover:opacity-80 flex items-center justify-center gap-1 cursor-pointer text-nowrap"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Remove File
                </button>
              )}
            </div>
          </div>
          <div id="right-info" className="w-full flex flex-col gap-2">
            <div id="info" className="flex flex-col gap-2">
              <span className="flex flex-col items-start gap-1">
                <p>FullName</p>
                <input
                  type="text"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleInput}
                  id="fullName"
                  placeholder="Your Fullname.."
                  className="p-2 w-full border border-stone-200 rounded-md outline-none"
                  required
                />
              </span>
              <span className="flex flex-col items-start gap-1">
                <p>Email (You can't change email address.)</p>
                <input
                  type="text"
                  name="userMail"
                  id="userMail"
                  value={userData.userMail}
                  readOnly
                  placeholder="Your Email.."
                  className="p-2 w-full border border-stone-200 rounded-md outline-none"
                  required
                />
              </span>
              <span className="flex flex-col items-start gap-1">
                <p>DisplayName</p>
                <input
                  type="text"
                  name="displayName"
                  value={userData.displayName}
                  onChange={handleInput}
                  id="displayName"
                  placeholder="Your DisplayName.."
                  className="p-2 w-full border border-stone-200 rounded-md outline-none"
                  required
                />
              </span>
              <span className="flex flex-col items-start gap-1">
                <p>Username</p>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleInput}
                  id="username"
                  placeholder="Your Username.."
                  className="p-2 w-full border border-stone-200 rounded-md outline-none"
                  required
                />
              </span>
              <span className="flex flex-row items-end justify-center gap-1">
                <span className="flex flex-col w-full items-start gap-1">
                  <p>Password</p>
                  <input
                    type="password"
                    name="password"
                    value="123456987"
                    id="password"
                    readOnly
                    placeholder="Your Password.."
                    className="p-2 w-full border border-stone-200 rounded-md outline-none"
                    required
                  />
                </span>
                <button
                  className="text-nowrap bg-teal-700 text-white p-2 rounded-md hover:bg-teal-900 cursor-pointer"
                  onClick={changePassword}
                >
                  Change Password
                </button>
              </span>
              <span className="flex flex-col items-start gap-1">
                <p>Bio</p>
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleInput}
                  id="bio"
                  placeholder="Your Profile Bio.."
                  className="p-2 w-full border border-stone-200 rounded-md outline-none"
                  required
                />
              </span>
            </div>
            <div id="other-info" className="flex flex-col gap-6">
              {userData.blocked.length !== 0 && (
                <div>
                  <h2>Blocked Users</h2>
                  {userData.blocked.map((user, index) => (
                    <div
                      key={index}
                      className="flex flex-row justify-between items-center border border-stone-200 p-1 rounded-md"
                    >
                      <p className="text-stone-500 truncate">{user}</p>
                      <button
                        className="px-2 py-1 hover:bg-teal-900 rounded-md bg-teal-700 cursor-pointer text-white"
                        onClick={() => unblockUser(userId!, user)}
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <span className="flex flex-row gap-2">
                  <p>Last Login : </p>
                  <p>
                    {userData.lastSeen instanceof Date
                      ? userData.lastSeen.toLocaleString()
                      : ""}
                  </p>
                </span>
                <span className="flex flex-row gap-2">
                  <p>Joined on : </p>
                  <p>
                    {userData.createdAt instanceof Date
                      ? userData.createdAt.toLocaleString()
                      : ""}
                  </p>
                </span>
              </div>
            </div>
            {showProfileMsg && <p className="text-red-500">{showProfileMsg}</p>}
            <div
              id="btns"
              className="flex flex-row w-full gap-2 max-[800px]:flex-col"
            >
              {loading ? (
                <button className="p-2 w-full flex flex-row items-center justify-center gap-2 bg-black text-white rounded-md cursor-not-allowed">
                  <BtnLoading />
                  Updating Profile..
                </button>
              ) : (
                <button
                  onClick={updateProfile}
                  className="p-2 w-full bg-teal-700 text-white rounded-md cursor-pointer hover:bg-teal-900"
                >
                  Update
                </button>
              )}

              <button
                className="p-2 w-full bg-black text-white rounded-md cursor-pointer hover:opacity-80"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
              <button
                className="p-2 w-full text-black rounded-md cursor-pointer border border-stone-200 hover:bg-stone-200"
                onClick={logoutUser}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
