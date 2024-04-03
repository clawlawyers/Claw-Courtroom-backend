const { ClientService } = require('../services');
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require('http-status-codes');
const path = require("path");
const { uploadFile } = require('../services/s3-service');
const { AWS_S3_BUCKET_NAME, AWS_REGION } = require('../config/server-config');
const { createToken } = require('../utils/common/auth');
const prisma = require('../config/prisma-client');
const { fetchGptUser } = require('../services/gpt-service');


/**
 * POST:  client/signup
 * req.body {email: 'client@gmail.com', password: "dsfj9sdjfoijw09"}
 **/
async function createClient(req, res) {
    try {
        const response = await ClientService.createClient({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
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


async function signin(req, res) {
    try {
        const response = await ClientService.signin({
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
        const response = req.body.client;
        const successResponse = SuccessResponse(response);
        return res
            .status(StatusCodes.OK)
            .json(successResponse)
    }
    catch (error) {
        return res.status(error.statusCode)
            .json(ErrorResponse({}, error));
    }
}

async function getClientById(req, res) {
    try {
        const response = await ClientService.getClient(req.query.id);
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

async function verify(req, res) {
    try {
        const { phoneNumber, verified } = req.body;
        const existing = await ClientService.getClientByPhoneNumber(phoneNumber);
        if (!existing) {
            const { client, jwt, expiresAt } = await ClientService.createClient({
                phoneNumber,
                verified
            });
            const data = { verified: client.verified, ambassador: client.ambassador ? true : false, registered: false, newGptUser: true, newClient: true };
            if (verified) {
                data.jwt = jwt;
                data.expiresAt = expiresAt;
            }
            const successResponse = SuccessResponse(data);
            return res.status(StatusCodes.CREATED).json(successResponse);
        }
        const updatedClient = await ClientService.updateClient(existing.id, { verified });
        const { jwt, expiresAt } = createToken({ id: updatedClient.id, phoneNumber });
        const existingGptUser = await fetchGptUser(existing.id);
        const successResponse = SuccessResponse({ newClient: false, verified: verified, registered: updatedClient.registered, ambassador: updatedClient.ambassador ? true : false, jwt, expiresAt, newGptUser: existingGptUser ? false : true });
        return res
            .status(StatusCodes.OK)
            .json(successResponse)
    }
    catch (error) {
        const errorResponse = ErrorResponse({}, error)
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse)
    }
}

async function createLeader(req, res) {
    try {
        const { phoneNumber, collegeName, firstName, lastName } = req.body;
        const existingUser = await ClientService.getClientByPhoneNumber(phoneNumber);

        if (!existingUser) {
            const newClient = await ClientService.createClient({ phoneNumber, collegeName, firstName, lastName, ambassador: true });
            return res.status(StatusCodes.CREATED).json(SuccessResponse(newClient));
        }
        else {
            const updatedClient = await ClientService.updateClient(existingUser.id, { collegeName, firstName, lastName, ambassador: true });
            return res.status(StatusCodes.OK).json(SuccessResponse(updatedClient));
        }
    } catch (error) {
        const errorResponse = ErrorResponse({}, error)
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse)
    }
}

async function register(req, res) {
    try {
        const { phoneNumber, ...rest } = req.body;
        const client = await ClientService.getClientByPhoneNumber(phoneNumber);
        if (!client) return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse({}, { message: "Invalid phone number" }));
        if (!client.verified) return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse({}, { message: "Client not verified" }));
        if (client.registered) return res.status(StatusCodes.BAD_GATEWAY).json(ErrorResponse({}, { message: "Client already registered" }));
        const updatedClient = await ClientService.updateClient(client.id, { ...rest, registered: true });
        return res.status(StatusCodes.OK).json(SuccessResponse(updatedClient));
    } catch (error) {
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse({}, error));
    }
}

async function getAllClients(req, res) {
    try {
        const data = await ClientService.getAllClients();
        const successResponse = SuccessResponse(data);
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function updateClient(req, res) {
    try {
        const { client, ...data } = req.body;
        const { id } = client;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            await uploadFile(req.file.buffer, `profilePic_client_${id}${ext}`);
            data.profilePicture = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/profilePic_client_${id}${ext}`;
        }

        const updatedClient = await ClientService.updateClient(id, data);
        const successResponse = SuccessResponse(updatedClient);
        return res.status(StatusCodes.OK).json(successResponse)

    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}


module.exports = {
    createClient,
    signin,
    getClientById,
    authMe,
    getAllClients,
    verify,
    updateClient,
    register,
    createLeader,
}