import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/configFirebase";

export const searchProfile = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "UserID required!",
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    const userProfile = await getDoc(userRef);

    if (userProfile.exists()) {
      return {
        success: true,
        message: "Found a user with UserId!",
        userData: userProfile.data(),
      };
    }

    return {
      success: false,
      message: "User does not exist!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
