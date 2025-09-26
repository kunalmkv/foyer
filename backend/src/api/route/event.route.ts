import express from "express";

const router = express.Router();

import eventController from "../controller/event.controller";

router.get("/", eventController.getEvents)
router.get("/:eventId", eventController.getEvent)
router.get("/:keyword/search", eventController.searchEvents)

router.post("/metadata/upload", eventController.uploadEventMetadata)

export default router;

