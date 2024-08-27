const Joi = require("joi");

const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid("male", "female", "others").required(),
    email: Joi.string().email().required(),
    barCouncilState: Joi.string().required(),
    barCouncilNo: Joi.number().required(),
    barCouncilYear: Joi.number().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.number().required(),
    phoneNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
});

module.exports = schema;