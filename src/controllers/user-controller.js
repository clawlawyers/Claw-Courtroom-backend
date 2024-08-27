const { AWS_S3_BUCKET_NAME, AWS_REGION } = require('../config/server-config');
const { UserService } = require('../services');
const { uploadFile } = require('../services/s3-service');
const { ErrorResponse, SuccessResponse } = require("../utils/common")
const { StatusCodes } = require('http-status-codes');
const path = require("path");
const { createToken } = require('../utils/common/auth');



async function registerUser(req, res) {
    try {
        const ext = path.extname(req.file.originalname);
        await uploadFile(req.file.buffer, `id_${req.body.barCouncilNo}${ext}`);

        const { phoneNumber, ...data } = req.body;
        data.id_url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/id_${req.body.barCouncilNo}${ext}`;
        data.registered = true;
        const updatedUser = await UserService.updateUserByPhoneNumber(phoneNumber, data);

        const { jwt, expiresAt } = createToken({ id: updatedUser.id, phoneNumber: updatedUser.phoneNumber });
        const successResponse = SuccessResponse({ jwt, expiresAt });
        return res
            .status(StatusCodes.OK)
            .json(successResponse)
    }
    catch (error) {
        const errorResponse = ErrorResponse({}, error);
        return res.status(error.statusCode)
            .json(errorResponse)
    }
}

async function verify(req, res) {
    try {
        const existing = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
        if (!existing) {
            // create a new lawyer
            await UserService.createUser(req.body);
            const successResponse = SuccessResponse({ newUser: true, registered: false, verified: req.body.verified });
            return res.status(StatusCodes.CREATED).json(successResponse)
        }
        const { verified } = req.body;
        await UserService.updateUserByPhoneNumber(req.body.phoneNumber, { verified });
        const successResponse = SuccessResponse({ newUser: false, registered: existing.registered, verified: verified })

        if (existing.registered) {
            const { jwt, expiresAt } = createToken({ id: existing.id, phoneNumber: existing.phoneNumber });
            successResponse.data.jwt = jwt;
            successResponse.data.expiresAt = expiresAt;
        }
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        return res.status(error.StatusCodes || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse({}, error));
    }
}

// not in use
async function signin(req, res) {
    try {
        const response = await UserService.signin({
            username: req.body.username,
            password: req.body.password
        });
        SuccessResponse.data = response;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }
    catch (error) {
        ErrorResponse.error = error
        return res.status(error.statusCode)
            .json(ErrorResponse)
    }
}

async function authMe(req, res) {
    try {

        const successResponse = SuccessResponse(req.body.user);
        return res
            .status(StatusCodes.OK)
            .json(successResponse);
    }
    catch (error) {
        const errorResponse = ErrorResponse({}, error);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse)
    }
}

async function getAllLawyers(req, res) {
    try {
        const data = await UserService.getAllLawyers();
        const successResponse = SuccessResponse(data);
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function getLawyerByPhoneNumber(req, res) {
    try {
        const { phoneNumber } = req.params;
        const lawyer = await UserService.getUserByPhoneNumber(phoneNumber);
        return res.status(StatusCodes.OK).json(SuccessResponse(lawyer));
    } catch (error) {
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse({}, error));
    }
}

async function updateUser(req, res) {
    try {
        const { user, ...data } = req.body;
        const { id } = user;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            await uploadFile(req.file.buffer, `profilePic_lawyer_${id}${ext}`);
            data.profilePicture = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/profilePic_lawyer_${id}${ext}`;
        }

        const updatedUser = await UserService.updateUser(id, data);
        const successResponse = SuccessResponse(updatedUser);
        return res.status(StatusCodes.OK).json(successResponse)

    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

module.exports = {
    registerUser,
    signin,
    authMe,
    verify,
    getAllLawyers,
    getLawyerByPhoneNumber,
    updateUser
}