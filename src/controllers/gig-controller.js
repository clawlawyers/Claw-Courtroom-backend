const { GigService } = require('../services')
const { ErrorResponse, SuccessResponse } = require("../utils/common")
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');


/**
 * POST:  /gig
 * req.body {
 *      country: "",
 *      profession: "",
 *      job_title: "",
 *      description: "",
 *      price_range: "",
 *      pincode: "",
 * }
 **/
async function createGig(req, res) {
    try {
        const response = await GigService.createGig(req.body);
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
 * GET:  /post?id='<post-id>'
 **/
async function getGig(req, res) {
    try {
        const id = req.query.id;
        let response;
        if(id == undefined){
            response = await GigService.getGigs();
        }
        else response = await GigService.getGigById(id);
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
 * PUT:  /post/:id
 * req.body: {}
 **/
async function updateGig(req, res) {
    try {
        const id = req.body.id || req.query.id;
        const gig = await GigService.getGigById(id);
        if(!gig){
            throw new AppError('Gig did not exist for the given id', StatusCodes.NOT_FOUND);

        }
        const country = req.body.country == undefined ? gig.country : req.body.country;
        const profession = req.body.profession == undefined ? gig.profession : req.body.profession;
        const job_title = req.body.job_title == undefined ? gig.job_title : req.body.job_title;
        const description = req.body.description == undefined ? gig.description : req.body.description;
        const price_range = req.body.price_range == undefined ? gig.price_range : req.body.price_range;
        const pincode = req.body.pincode == undefined ? gig.pincode : req.body.pincode;
        const data = {
            country,
            profession,
            job_title,
            description,
            price_range,
            pincode,
        }
        response = await GigService.updateGig(id, data);
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
 * DELETE:  /post/:id
 * req.body {id: '<post-id>'}
 **/
async function deleteGig(req, res) {
    try {
        const id = req.body.id || req.query.id;
        const gig = await GigService.getGigById(id);
        if(!gig){
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
    createGig,
    getGig,
    updateGig,
    deleteGig,
}