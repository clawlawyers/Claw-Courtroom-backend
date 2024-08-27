const { NewsRespository } = require('../repositories');
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error');

const newsRepository = new NewsRespository();

async function getNews(type) {
    try {
        if (type !== 0 && type !== 1) throw new AppError("Invalid type arg", 400);
        const news = await newsRepository.findByType(type);
        return news;
    } catch (error) {
        throw new AppError(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getNews
}