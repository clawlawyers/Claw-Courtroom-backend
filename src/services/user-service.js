const { UserRepository } = require('../repositories')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error')
const { checkPassword, createToken, verifyToken } = require('../utils/common/auth')


const userRepository = new UserRepository();

async function createUser(data) {
    try {
        const user = await userRepository.create(data);
        const { jwt } = createToken({ id: user.id, email: user.email });
        return {
            user,
            jwt,
        };
    }
    catch (error) {
        if (error.code === 11000) {
            throw new AppError(error.message, StatusCodes.CONFLICT);
        }
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateUser(id, data) {
    try {
        const user = await userRepository.update(id, data);
        return user;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateUserByPhoneNumber(phoneNumber, data) {
    try {
        const user = await userRepository.updateByPhoneNumber(phoneNumber, data);
        return user;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getUser() {
    try {
        const user = await userRepository.get();
        return user;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


async function signin(data) {
    try {
        const user = await userRepository.getUserByUsername(data.username);
        if (!user) {
            throw new AppError('No user found for the given username', StatusCodes.NOT_FOUND);
        }
        const passwordMatch = checkPassword(data.password, user.password);
        if (!passwordMatch) {
            throw new AppError('Password do not match', StatusCodes.BAD_REQUEST);
        }
        const {jwt} = createToken({ id: user.id, email: user.email });

        return {
            jwt: jwt
        };
    }
    catch (error) {
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


async function getUserFromToken(token) {
    try {
        if (!token) {
            return new AppError('Missing jwt token', StatusCodes.BAD_REQUEST);
        }
        const response = verifyToken(token);
        const user = await userRepository.getUserById(response.id);
        if (!user) {
            throw new AppError('No user found', StatusCodes.NOT_FOUND);
        }
        return user;
    }
    catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAllLawyers() {
    try {
        const lawyers = await userRepository.getAll();
        return lawyers
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getUserById(id) {
    try {
        const user = await userRepository.getUserById(id);
        return user;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getUserByPhoneNumber(phoneNumber) {
    try {
        const user = await userRepository.getUserByPhoneNumber(phoneNumber);
        return user;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createUser,
    signin,
    getUserFromToken,
    getUserById,
    getUser,
    getAllLawyers,
    getUserByPhoneNumber,
    updateUserByPhoneNumber,
    updateUser,
}