import joi from 'joi';

export default joi.object({
    eventId: joi.number().positive().optional(),
    type: joi.string().valid('OFFER_TO_BUY', 'OFFER_TO_SELL').required(),
    sellerAddress: joi.string().required(),
    buyerAddress: joi.string().allow(null).optional(),
    quantity: joi.number().positive().required(),
    seatNumbers: joi.array().items(joi.string()).optional(),
    seatType: joi.string().required(),
    isPhysicalTicketNeededToAttend: joi.boolean().required(),
});



