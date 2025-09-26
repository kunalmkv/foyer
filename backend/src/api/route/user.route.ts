import express from "express";

const router = express.Router();

import userController from "../controller/user.controller";

router.get("/:userAddress/nonce", userController.getNonce)
router.post("/validate/nonce", userController.validateNonce)

export default router;

