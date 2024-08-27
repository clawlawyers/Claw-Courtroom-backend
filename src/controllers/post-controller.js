const { PostService, ClientService } = require('../services')
const { ErrorResponse, SuccessResponse } = require("../utils/common")
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');


/**
 * POST:  /post
 * req.body {description: "", price_range: ""}
 **/
async function createPost(req, res) {
    try {
        const response = await PostService.createPost({
            description: req.body.description,
            price_range: req.body.price_range,
            client: req.body.client.id,
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


/**
 * GET:  /post?id='<post-id>'
 **/
async function getPost(req, res) {
    try {
        const id = req.query.id;
        let response;
        if(id == undefined){
            response = await PostService.getPosts();
        }
        else response = await PostService.getPostById(id);
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
async function updatePost(req, res) {
    try {
        const id = req.body.id || req.query.id;
        const clientId = req.body.client.id;
        const post = await PostService.getPostById(id);
        if(!post){
            throw new AppError('Post did not exist for the given id', StatusCodes.NOT_FOUND);

        }
        if(post.client != clientId){
            throw new AppError('You are not authorized to update the post', StatusCodes.UNAUTHORIZED);
        }
        const description = req.body.description == undefined ? post.description : req.body.description;
        const price_range = req.body.price_range == undefined ? post.price_range : req.body.price_range;
        const data = {
            description,
            price_range,
        }
        response = await PostService.updatePost(id, data);
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
async function deletePost(req, res) {
    try {
        const id = req.body.id || req.query.id;
        const clientId = req.body.client.id;
        const post = await PostService.getPostById(id);
        if(!post){
            throw new AppError("Post Doesn't exists for the given id", StatusCodes.BAD_REQUEST);
        }
        if(post.client != clientId){
            throw new AppError('You are not authorized to delete the post', StatusCodes.UNAUTHORIZED);
        }
        const response = await PostService.deletePost({
            postId: id,
            clientId: clientId,
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
module.exports = {
    createPost,
    getPost,
    updatePost,
    deletePost,
}