import _ from "lodash";

import mongoLib from "../../lib/mongo.lib";
import loggerLib from "../../lib/logger.lib";

import eventModel from "../../model/event.model";
import eventStatusEnum from "../../enum/event.status.enum";
import eventCategoryEnum from "../../enum/event.category.enum";

async function getEvents(req: any, res: any) {
    try {
        const {status, category, page = 1, limit = 10} = req.query;

        if (page <= 0 || limit <= 0) {
            return res.status(400).send({message: "Bad Request", details: "page and limit must be positive integers"});
        }

        if (limit > 100) {
            return res.status(400).send({message: "Bad Request", details: "limit must not exceed 100"});
        }

        if (status && !Object.values(eventStatusEnum).includes(status)) {
            return res.status(400).send({
                message: "Bad Request",
                details: `status must be one of ${Object.values(eventStatusEnum).join(", ")}`
            });
        }

        if (category && !Object.values(eventCategoryEnum).includes(category)) {
            return res.status(400).send({
                message: "Bad Request",
                details: `category must be one of ${Object.values(eventCategoryEnum).join(", ")}`
            });
        }

        const events = await mongoLib.findWithSkipLimit(
            eventModel,
            {
                ...(category ? {category: category} : {}),
                ...(status ? {status: status} : {}),
            },
            (page - 1) * limit,
            limit
        );

        return res.status(200).send({message: "Success", events: events});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function getEvent(req: any, res: any) {
    try {
        let {eventId} = req.params;
        if (_.isEmpty(eventId)) {
            return res.status(400).send({message: "Bad Request", details: "eventId is required"});
        }

        try {
            eventId = parseInt(eventId);
        } catch (error) {
            return res.status(400).send({message: "Bad Request", details: "eventId must be a number"});
        }

        const event = await mongoLib.findOne(eventModel, {id: eventId});
        if (_.isEmpty(event)) {
            return res.status(404).send({message: "Event not found"});
        }

        return res.status(200).send({message: "Success", event: event});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function searchEvents(req: any, res: any) {
    try {
        const {keyword} = req.params;

        if (_.isEmpty(keyword)) {
            const events = await mongoLib.findWithSkipLimit(eventModel, {status: eventStatusEnum.UPCOMING}, 0, 10);
            return res.status(200).send({message: "Success", events: events});
        }

        const events = await mongoLib.findWithSkipLimit(
            eventModel,
            {
                $or: [
                    {name: {$regex: keyword, $options: "i"}},
                    {description: {$regex: keyword, $options: "i"}},
                    {category: {$regex: keyword, $options: "i"}},
                ]
            },
            0,
            10
        );

        return res.status(200).send({message: "Success", events: events});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

export default {
    getEvent: getEvent,
    getEvents: getEvents,
    searchEvents: searchEvents,
}