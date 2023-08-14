import express from "express";
import { login,activateUser,forgotPassword,resetPassword } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.patch("/activateuser/:id",activateUser);
router.put("/forgotpassword",forgotPassword);
router.patch("/passwordreset/:id",resetPassword);

export default router;
