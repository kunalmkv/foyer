import joi from 'joi';

export default joi.object({
    sellerAddress: joi.string().required(),
    buyerAddress: joi.string().allow(null).optional(),
    quantity: joi.number().positive().required(),
    seatNumbers: joi.array().items(joi.string()).optional(),
    seatType: joi.string().required(),
    isPhysicalTicketNeededToAttend: joi.boolean().required(),
});



