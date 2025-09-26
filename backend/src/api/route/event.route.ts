import express from "express";

const router = express.Router();

import eventController from "../controller/event.controller";

router.get("/", eventController.getEvents)
router.get("/:eventId", eventController.getEvent)
router.get("/:keyword/search", eventController.searchEvents)

export default router;

