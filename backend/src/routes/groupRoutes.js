import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createGroup, getGroupById, getUserGroups, addMember, removeMember, renameGroup, leaveGroup, } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/user", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupById);
router.put("/:groupId/add", protectRoute, addMember);
router.put("/:groupId/remove", protectRoute, removeMember);
router.put("/:groupId/rename", protectRoute, renameGroup);
router.put("/:groupId/leave", protectRoute, leaveGroup);

export default router;