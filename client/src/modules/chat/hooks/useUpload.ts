import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import type React from "react";
import { db } from "../../auth/config/configFirebase";

export const useUploadImage = async (file: File, userId: string) => {
  if (!file) {
    return {
      success: false,
      message: "Required File!",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profile_preset");

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const req = await fetch(cloudUrl, {
      method: "POST",
      body: formData,
    });

    if (!req.ok) {
      return {
        success: false,
        message: "Failed to upload image!",
      };
    }

    const res = await req.json();

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "profile.imageUrl": res.secure_url,
      "timeStamps.updatedAt": serverTimestamp()
    });

    return {
      success: true,
      message: "Image uploaded successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const useUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) {
    return {
      success: false,
      message: "File Required!",
    };
  }

  try {
    const file = e.target.files[0];

    const imgSize = 2 * 1024 * 1024;

    if (file.size > imgSize) {
      return {
        success: false,
        message: "File is too large, upload another!",
      };
    }

    return {
      success: true,
      message: "Uploading to Cloud!",
      image: file,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
