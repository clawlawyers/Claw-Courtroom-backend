const Joi = require("joi");
const { billingCycles } = require('../utils/common/constants');
const { MONTHLY, YEARLY, LIFETIME } = billingCycles;


const schema = Joi.object({
    amount: Joi.number().required(),
    plan: Joi.string().required(),
    billingCycle: Joi.string().valid(MONTHLY, YEARLY, LIFETIME),
    request: Joi.number().required(),
    session: Joi.number().required(),
})

module.exports = schema;