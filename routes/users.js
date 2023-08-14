import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  getUserprofile
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getUser);
router.get("/:id",verifyToken,getUserprofile);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
