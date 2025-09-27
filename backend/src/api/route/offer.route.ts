import express from "express";

const router = express.Router();

import offerController from "../controller/offer.controller";

router.get("/event/:eventId", offerController.getEventOffers)
router.get("/user/:userAddress", offerController.getUserOffers)
router.get("/:offerId", offerController.getOffer)

router.post("/metadata/upload", offerController.uploadOfferMetadata)

export default router;

