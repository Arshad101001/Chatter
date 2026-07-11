import express from "express";
import { getChatPartners, getLastMessages, getMessagesByUserId, getUserByEmail, sendMessage, updateReadStatus, deleteMessageByMessageId, editMessage } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

// the middleware execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
router.use(arcjetProtection, protectRoute);

router.get("/chats", getChatPartners);
router.get("/last-messages", getLastMessages);
router.get("/:id", getMessagesByUserId);
router.get("/find-by-email/:email", getUserByEmail);
router.post("/send/:id", sendMessage);
router.put("/read/:senderId", updateReadStatus);
router.delete("/delete-message/:messageId", deleteMessageByMessageId);
router.put("/edit-message/:id", editMessage);

export default router;
