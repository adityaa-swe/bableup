import { authToken } from "../config/firebaseAdmin.js";

const tokenCache = new Map();
function setCache(key, value, ttl = 10 * 60 * 1000) {
  tokenCache.set(key, value);
  setTimeout(() => tokenCache.delete(key), ttl).unref();
}

export const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ err: "Unauthorized User!" });
    }

    const token = authHeader.split(" ")[1];

    if (tokenCache.has(token)) {
      req.user = tokenCache.get(token);
      return next();
    }

    const user = await authToken(token);
    if (!user) {
      return res.status(401).json({ err: "Unauthorized User!" });
    }

    req.user = user;
    setCache(token, user);
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ err: "Unauthorized User!" });
  }
};
