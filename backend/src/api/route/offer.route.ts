import express from "express";

const router = express.Router();

import offerController from "../controller/offer.controller";

router.get("/event/:eventId", offerController.getEventOffers)
router.get("/:offerId", offerController.getOffer)

export default router;

