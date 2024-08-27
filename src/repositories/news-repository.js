const CrudRepository = require("./crud-repository");
const { News } = require("../models");

class NewsRespository extends CrudRepository {
    constructor() {
        super(News);
    }

    async findByType(type) {
        try {
            const news = await News.find({ type });
            return news;
        } catch (error) {
            throw error;
        }
    }

    async deleteOlderThan(type, timestamp) {
        try {
            const deletedNews = await News.deleteMany({ type, createdAt: { $lte: timestamp } });
            return deletedNews;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = NewsRespository;