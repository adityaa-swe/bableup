export interface updateProfile {
  fullName: string;
  userMail: string;
  displayName: string;
  username: string;
  bio: string;
  blocked: string[];
  lastSeen: Date;
  createdAt: Date;
  imageUrl: string;
  userId: string;
}

export interface otherUser {
  fullName: string;
  userMail: string;
  displayName: string;
  username: string;
  bio: string;
  imageUrl: string;
  userId: string;
}

export interface otherChat {
  _id: string;
  createdAt: string;
  updatedAt: string;
  members: string[];
  deletedFor: string[];
  success: boolean;
  lastMessage: string;
  message?: string;
  userData: {
    bio: string;
    displayName: string;
    fullName: string;
    imageUrl: string;
    userId: string;
    userMail: string;
    username: string;
  };
}

export interface userMessage {
  _id?: string;
  chatId: string,
  sender: string;
  text: string;
  createdAt: Date;
}
