const { LeadService } = require('../services')
const { ErrorResponse, SuccessResponse } = require("../utils/common")
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');


/**
 * POST:  /gig
 * req.body {
 *      lawyer: "",
 *      name: "",
 *      email: "",
 *      mobile: "",
 *      location: "",
 *      graduation: "",
 *      experience: "",
 * }
 **/
async function createLead(req, res) {
    try {
        const response = await LeadService.createLead(req.body);
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


/**
 * GET:  /lead?id='<lead-id>'
 **/
async function getLead(req, res) {
    try {
        const id = req.query.id;
        let response;
        if(id == undefined){
            response = await LeadService.getleads();
        }
        else response = await LeadService.getLeadById(id);
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


/**
 * DELETE:  /lead/:id
 * req.body {id: '<lead-id>'}
 **/
async function deleteLead(req, res) {
    try {
        const id = req.body.id || req.query.id;
        const lead = await LeadService.getLeadById(id);
        if(!lead){
            throw new AppError("Post Doesn't exists for the given id", StatusCodes.BAD_REQUEST);
        }
        const response = await GigService.deleteGig(id);
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
module.exports = {
    createLead,
    getLead,
    deleteLead,
}