import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../key/bableup.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const authToken = async (idToken) => {
  try {
    const token = await admin.auth().verifyIdToken(idToken);
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
}
