const Joi = require("joi");

const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    phoneNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
})

module.exports = schema;