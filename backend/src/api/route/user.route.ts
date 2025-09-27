import express from "express";

const router = express.Router();

import userController from "../controller/user.controller";

router.get("/:userAddress/nonce", userController.getNonce)
router.get("/:userAddress/info", userController.getUserInfo)

router.post("/validate/nonce", userController.validateNonce)

export default router;

