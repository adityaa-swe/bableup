import React from "react";
import type { otherUser } from "../types/userProfile";


interface closeProfileType {
  closeProfile: () => void;
  userData: otherUser;
}

const UserCard: React.FC<closeProfileType> = ({ closeProfile, userData }) => {

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={closeProfile}
    >
      <div
        className="flex flex-col w-64 bg-white justify-center mx-auto p-2 rounded-lg gap-2 border border-stone-200 my-24 z-50 "
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          <button
            className="text-stone-400 flex rounded-lg p-1 cursor-pointer hover:bg-stone-200"
            onClick={closeProfile}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </span>
        <div id="userdata">
          <div id="img-card" className="flex justify-center items-center mb-4">
            <img
              className="rounded-full object-cover w-48 h-48"
              src={userData?.imageUrl || "https://avatar.iran.liara.run/public"}
              alt="profile-image"
            />
          </div>
          <div id="info-card" className="flex flex-col">
            <span className="flex flex-row items-center gap-1">
              <label htmlFor="name" className="font-bold">
                Name :{" "}
              </label>
              <p>{userData?.fullName || "Not provided"}</p>
            </span>
            <span className="flex flex-row items-center gap-1">
              <label htmlFor="profile-name" className="font-bold">
                Profile Name :{" "}
              </label>
              <p>{userData?.displayName || "Not provided"}</p>
            </span>
            <span className="flex flex-row items-center gap-1">
              <label htmlFor="bio" className="font-bold">
                Bio :{" "}
              </label>
              <p>{userData?.bio || "Not provided"}</p>
            </span>
            <span className="flex flex-row items-center gap-1">
              <label htmlFor="username" className="font-bold">
                Username :{" "}
              </label>
              <p>@{userData?.username || "Not provided"}</p>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
