import joi from 'joi';

export default joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    venue: joi.string().required(),
    category: joi.string().required(),
    imageUrl: joi.string().uri().required(),
});



