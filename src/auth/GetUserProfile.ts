import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/config"

const getProfile = async (id:string) => {
    const userRef = doc(db, "users", id);
    const getData = await getDoc(userRef);
    
    if (getData.exists()) {
        return getData.data();
    } else {
        return null;
    }
}

export default getProfile;