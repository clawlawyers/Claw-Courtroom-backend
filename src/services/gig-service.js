const { GigRepository } = require('../repositories')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error')

const gigRepository = new GigRepository();

async function createGig(data) {
    try {
        const gig = await gigRepository.create(data);
        return gig;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getGigs(){
    try {
        const gigs = await gigRepository.get();
        return gigs;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getGigById(id) {
    try {
        const gig = await gigRepository.getGigById(id);
        return gig;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateGig(id, data) {
    try {
        const gig = await gigRepository.update(id, data);
        return gig;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


async function deleteGig(id){
    try {
        const response = await gigRepository.deleteGig(id);
        return response;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    createGig,
    getGigs,
    getGigById,
    updateGig,
    deleteGig,
}