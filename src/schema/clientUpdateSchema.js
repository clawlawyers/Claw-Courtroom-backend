const Joi = require("joi");

const schema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email()
});

module.exports = schema;