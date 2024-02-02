const Joi = require('joi');
const { userSignupSchema } = require('../../schema/userSignUpSchema');
const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

async function validateUserSignUpRequest(req, res, next) {
    try {
        req.body.barCouncilNo = Joi.attempt(req.body.barCouncilId, Joi.number());
        req.body.barCouncilYear = Joi.attempt(req.body.barCouncilYear, Joi.number());
        req.body.pincode = Joi.attempt(req.body.pincode, Joi.number());

        await userSignupSchema.validateAsync(req.body);
        next();
    }
    catch (error) {
        console.log(error)
        res.status(StatusCodes.BAD_REQUEST).send(error);
    }
}

function validateSignUpRequest(req, res, next) {
    if (!req.body.username) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["username not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.email) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["email not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.password) {
        ErrorResponse.message = "Something went wrong while authenticating";
        ErrorResponse.error = new AppError(["password not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validateLoginRequest(req, res, next) {
    if (!req.body.username) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["username not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.password) {
        ErrorResponse.message = "Something went wrong while authenticating";
        ErrorResponse.error = new AppError(["password not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}


async function validateAuthRequest(req, res, next) {
    if (!req.headers['authorization']) {
        ErrorResponse.message = "Something went wrong while verifying token";
        ErrorResponse.error = new AppError(["token not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validatePostRequest(req, res, next) {
    if (!req.body.description || req.body.description === "") {
        ErrorResponse.message = "Description can't be empty.";
        ErrorResponse.error = new AppError(["Description is not found in the incoming message"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    if (!req.body.price_range || req.body.price_range === "") {
        ErrorResponse.message = "Price Range can't be empty.";
        ErrorResponse.error = new AppError(["Price Range is not found in the incoming message"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validatePostUpdateRequest(req, res, next) {
    if (!req.body.id && req.body.id === "" && req.query.id === "") {
        ErrorResponse.message = "Post Id cannot be empty";
        ErrorResponse.error = new AppError("Post id not found in the incoming message", StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}


module.exports = {
    validateSignUpRequest,
    validateLoginRequest,
    validateAuthRequest,
    validatePostRequest,
    validatePostUpdateRequest,
    validateUserSignUpRequest,
}