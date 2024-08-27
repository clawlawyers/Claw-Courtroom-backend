const {addPosttoClient, deletePostfromClient} = require('./client-service')
const { PostRepository } = require('../repositories')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error')

const postRepository = new PostRepository();

async function createPost(data) {
    try {
        const post = await postRepository.create(data);
        const client = await addPosttoClient(data.client, post.id);
        return post;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getPosts(){
    try {
        const post = await postRepository.get();
        return post;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getPostById(id) {
    try {
        const post = await postRepository.getPostById(id);
        return post;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updatePost(id, data) {
    try {
        const post = await postRepository.update(id, data);
        return post;
    }
    catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


async function deletePost(data){
    try {
        const response = await postRepository.deletePost(data.postId);
        const client = await deletePostfromClient(data.clientId, data.postId);
        return response;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
}