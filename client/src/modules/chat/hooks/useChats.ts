import { doc, getDoc } from "firebase/firestore";
import { db } from "../../auth/config/configFirebase";

export const getChats = async (userId: string, token: any) => {
  if (!userId) {
    return {
      success: false,
      message: "UserId is required!",
    };
  }

  try {
    let serverURL = import.meta.env.VITE_SERVER_URL;
    // Get chats for user
    let req = await fetch(`${serverURL}/chat/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    });

    if (!req.ok) {
      return {
        success: false,
        message: req.statusText,
      };
    }

    let res = await req.json();

    return {
      success: true,
      message: "Successful!",
      chats: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getProfileChat = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "UserId is required!",
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    const userProfile = await getDoc(userRef);

    if (userProfile.exists()) {
      const user = userProfile.data();
      return {
        success: true,
        message: "User Found!",
        userData: {
          fullName: user.profile.fullName,
          userMail: user.userMail,
          bio: user.profile.bio,
          userId: user.userId,
          username: user.profile.username,
          imageUrl: user.profile.imageUrl,
          displayName: user.profile.displayName,
        },
      };
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const startChat = async (
  userId: string,
  otherUserId: string,
  token: any
) => {
  if (!userId || !otherUserId) {
    return {
      success: false,
      message: "UserIds are required!",
    };
  }

  try {
    const serverURL = import.meta.env.VITE_SERVER_URL;
    const chatMembers = {
      members: [userId, otherUserId],
    };
    // Start new chat
    const req = await fetch(`${serverURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(chatMembers),
    });

    if (!req.ok) {
      return {
        success: false,
        message: req.statusText,
      };
    }

    const res = await req.json();
    return {
      success: true,
      message: "Chat created successfully!",
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteChat = async (userId: string, chatId: string, token:any) => {
  if (!userId || !chatId) {
    return {
      success: false,
      message: "IDs are required!",
    };
  }

  try {
    const serverURL = import.meta.env.VITE_SERVER_URL;
    const req = await fetch(`${serverURL}/chat/${chatId}/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    });

    if (!req.ok) {
      return {
        success: false,
        message: req.statusText,
      };
    }

    const res = await req.json();
    return {
      success: true,
      message: "Deleted Successfully!",
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
