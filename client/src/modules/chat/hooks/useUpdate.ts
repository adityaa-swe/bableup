import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../auth/config/configFirebase";

export const useUpdateData = async (
  fullName: string,
  username: string,
  displayName: string,
  bio: string,
  userId: string
) => {
  if (!fullName || !username || !displayName || !bio || !userId) {
    return {
      success: false,
      message: "All fields are required!",
    };
  }

  try {
    const userDB = collection(db, "users");
    const searchUsername = query(
      userDB,
      where("profile.username", "==", username)
    );

    const isUsernameExist = await getDocs(searchUsername);

    if (!isUsernameExist.empty) {
      return {
        success: false,
        message: "Username is taken!",
      };
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "profile.fullName": fullName,
      "profile.username": username,
      "profile.displayName": displayName,
      "profile.bio": bio,
      "timeStamps.updatedAt": new Date().toLocaleString(),
    });

    return {
      success: true,
      message: "Profile updated successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const removeBlockUser = async (userId: string, otherUserId: string) => {
  if (!userId || !otherUserId) {
    return {
      success: false,
      message: "IDs are required!",
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "relations.blocked": arrayRemove(otherUserId),
      "timeStamps.updatedAt": new Date().toLocaleString(),
    });

    return {
      success: true,
      message: "User unblocked successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const useDeleteImage = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "UserId required!",
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "profile.imageUrl": "",
      "timeStamps.updatedAt": new Date().toLocaleString(),
    });

    return {
      success: true,
      message: "Image removed successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const blockUser = async (userId: string, otherUserId: string) => {
  if (!userId || !otherUserId) {
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "relations.blocked": arrayUnion(otherUserId),
    });

    return {
      success: true,
      message: "User blocked successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
