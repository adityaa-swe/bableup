import express from "express";
import { createChat, deleteChatForUser, getChatMessages, getChats } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", createChat);

router.get("/:userId", getChats);

router.get("/:chatId/messages", getChatMessages);

router.delete("/:chatId/user/:userId", deleteChatForUser);

export default router;