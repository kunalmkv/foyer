import joi from 'joi';

export default joi.object({
    quantity: joi.number().positive().required(),
    seatNumbers: joi.array().items(joi.required()).optional(),
    seatType: joi.string().required(),
    isPhysicalTicketNeededToAttend: joi.boolean().required(),
});



