import type { otherUser } from "../types/userProfile";
import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAt,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../auth/config/configFirebase";

export const useSearchUsers = async (input: string, userId:string): Promise<otherUser[]> => {
  if (!input || !userId) {
    return [];
  }

  try {
    const results: otherUser[] = [];
    const userDB = collection(db, "users");
    const searchUsers = query(
      userDB,
      orderBy("profile.username"),
      startAt(input.toLowerCase()),
      endAt(input.toLowerCase() + "\uf8ff"), limit(10));
    const getSnaps = await getDocs(searchUsers);

    getSnaps.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();

      if (userId == data.userId) return;
      
      results.push({
        fullName: data.profile.fullName || "",
        userMail: data.userMail,
        displayName: data.profile.displayName,
        username: data.profile.username,
        bio: data.profile.bio,
        imageUrl: data.profile.imageUrl,
        userId: data.userId,
      });
    });

    return results;
  } catch (error) {
    return [];
  }
};
