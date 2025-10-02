import { create } from "zustand";
import type { userProfile, userStore } from "../types/userData";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../config/configFirebase";
import { doc, getDoc } from "firebase/firestore";

// Zustand Store

export const useUserStore = create<userStore>(() => ({
  firebase: null,
  custom: null,
  loading: true,
}));

// Store Updates

onAuthStateChanged(auth, async (firebaseUser) => {
  const set = useUserStore.setState;

  if (firebaseUser) {
    const userRef = doc(db, "users", firebaseUser?.uid);
    const snapShot = await getDoc(userRef);
    if (snapShot.data()) {
      set({
        firebase: firebaseUser,
        custom: snapShot.data() as userProfile,
        loading: false,
      });
    }

    setTimeout(() => {
      signOut(auth);
    }, 60 * 60 * 1000);
  } else {
    set({ firebase: null, custom: null, loading: false });
    return;
  }
});
