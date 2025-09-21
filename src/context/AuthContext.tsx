import { onAuthStateChanged, type User } from "firebase/auth";
import type { Profile } from "../types/userProfile";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/config";

interface authType {
  firebaseUser: User | null;
  bableUpUser: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<authType>({
  firebaseUser: null,
  bableUpUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setfirebaseUser] = useState<User | null>(null);
  const [bableUpUser, setBableUpUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const useRef = doc(db, "users", uid);
      const getUser = await getDoc(useRef);

      if (!getUser.exists()) return null;
      return getUser.data() as Profile;
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  };

  useEffect(() => {
    const trackUser = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          setfirebaseUser(firebaseUser);
          const userProfile = await fetchProfile(firebaseUser.uid);
          setBableUpUser(userProfile);
          setLoading(false);
          return;
        } else {
          console.log("Email Verification needed");
          setLoading(false);
          return;
        }
      } else {
        setLoading(false);
        console.log("Login Needed");
        return;
      }
    })

    return () => trackUser();

  }, []);

  const Profile = useMemo(() => ({
    firebaseUser, loading, bableUpUser
  }), [firebaseUser, loading, bableUpUser]);

  return <AuthContext.Provider value={Profile}>{children}</AuthContext.Provider>

};

export const BableUp = () => useContext(AuthContext);