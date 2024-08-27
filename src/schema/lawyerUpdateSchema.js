const Joi = require("joi");

const schema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    gender: Joi.string().valid("male", "female", "others"),
    email: Joi.string().email(),
    barCouncilState: Joi.string(),
    barCouncilNo: Joi.number(),
    barCouncilYear: Joi.number(),
    state: Joi.string(),
    city: Joi.string(),
    pincode: Joi.number(),
    about: Joi.string(),
});

module.exports = schema;