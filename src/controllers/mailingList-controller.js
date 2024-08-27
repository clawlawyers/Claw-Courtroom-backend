const { MailingListService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

async function addSubscriber(req, res) {
    try {
        const { email } = req.body;
        if (!email) throw new AppError("Invalid Email", StatusCodes.BAD_REQUEST);
        const response = await MailingListService.createSubscriber(email);
        res.status(StatusCodes.OK).json(SuccessResponse(response, {}));
    } catch (error) {
        res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse({}, error));
    }
}

module.exports = {
    addSubscriber
}