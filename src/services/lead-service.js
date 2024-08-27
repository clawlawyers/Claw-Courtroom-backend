const { LeadRepository } = require('../repositories')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error')

const leadRepository = new LeadRepository();

async function createLead(data) {
    try {
        const lead = await leadRepository.create(data);
        return lead;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getleads(){
    try {
        const leads = await leadRepository.get();
        return leads;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getLeadById(id) {
    try {
        const lead = await leadRepository.getById(id);
        return lead;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateLead(id, data) {
    try {
        const lead = await leadRepository.update(id, data);
        return lead;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


async function deleteLead(id){
    try {
        const lead = await leadRepository.deleteLead(id);
        return lead;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    createLead,
    getleads,
    getLeadById,
    updateLead,
    deleteLead,
}