export const getMessages = async (chatId: string, token: any) => {
  if (!chatId) {
    return {
      success: false,
      message: "ChatId is required!",
    };
  }

  try {
    const serverURL = import.meta.env.VITE_SERVER_URL;
    const req = await fetch(`${serverURL}/chat/${chatId}/messages`, {
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

    const res = await req.json();
    return {
      success: true,
      message: "successful",
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
