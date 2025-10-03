import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true});

const serviceAccount = {
  project_id: process.env.SA_PROJECT_ID,
  private_key: process.env.SA_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.SA_CLIENT_EMAIL,
  client_id: process.env.SA_CLIENT_ID,
  auth_uri: process.env.SA_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.SA_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.SA_AUTH_PROVIDER_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.SA_CLIENT_CERT_URL
};

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
};
