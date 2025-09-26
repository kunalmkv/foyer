import express from "express";

const router = express.Router();

import proposalController from "../controller/proposal.controller";


router.post("/suggest", proposalController.suggestProposal);
router.get("/", proposalController.getProposals);
router.get("/:proposalId", proposalController.getProposal);
router.post("/:proposalId/vote", proposalController.voteProposal);

export default router;
