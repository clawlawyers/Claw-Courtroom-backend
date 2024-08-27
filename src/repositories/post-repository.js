const { Post } = require('../models')
const CrudRepository = require('./crud-repository');

class PostRepository extends CrudRepository {
    constructor() {
        super(Post);
    }

    async getPostById(id) {
        try {
            const post = await Post.findById(id).exec();
            return post;
        } catch (error) {
            throw error;
        }
    }

    async getPostByClient(client){
        try {
            const posts = await Post.find({client});
            return posts;
        } catch (error) {
            throw error;
        }
    }

    async deletePost(id){
        try {
            const response = await Post.findOneAndDelete({_id: id})
            return response;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = PostRepository;