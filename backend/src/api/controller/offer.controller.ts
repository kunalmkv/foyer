import _ from "lodash";

import mongoLib from "../../lib/mongo.lib";
import loggerLib from "../../lib/logger.lib";

import offerModel from "../../model/offer.model";
import offerStatusEnum from "../../enum/offer.status.enum";

async function getEventOffers(req: any, res: any) {
    try {
        const {eventId} = req.params;
        if (_.isEmpty(eventId)) {
            return res.status(400).send({message: "Bad Request", details: "eventId is required"});
        }

        const {status, page = 1, limit = 10} = req.query;
        if (page <= 0 || limit <= 0) {
            return res.status(400).send({message: "Bad Request", details: "page and limit must be positive integers"});
        }
        if (limit > 100) {
            return res.status(400).send({message: "Bad Request", details: "limit must not exceed 100"});
        }

        if (status && !Object.values(offerStatusEnum).includes(status)) {
            return res.status(400).send({
                message: "Bad Request",
                details: `status must be one of ${Object.values(offerStatusEnum).join(", ")}`
            });
        }

        const offers = await mongoLib.findWithSkipLimit(
            offerModel,
            {
                eventId: eventId,
                ...(status ? {status: status} : {})
            },
            (page - 1) * limit,
            limit
        );

        return res.status(200).send({message: "Success", offers: offers});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

async function getOffer(req: any, res: any) {
    try {
        let {offerId} = req.params;
        if (_.isEmpty(offerId)) {
            return res.status(400).send({message: "Bad Request", details: "offerId is required"});
        }

        try {
            offerId = parseInt(offerId);
        } catch (error) {
            return res.status(400).send({message: "Bad Request", details: "eventId must be a number"});
        }

        const offer = await mongoLib.findOne(offerId, {id: offerId});
        if (_.isEmpty(offer)) {
            return res.status(404).send({message: "Offer not found"});
        }

        return res.status(200).send({message: "Success", offer: offer});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

export default {
    getOffer: getOffer,
    getEventOffers: getEventOffers,
}