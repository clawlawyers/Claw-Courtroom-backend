const Joi = require("joi");

const schema = Joi.object({
    phoneNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    verified: Joi.boolean().required()
})

module.exports = schema;