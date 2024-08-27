const { Gig } = require('../models')
const CrudRepository = require('./crud-repository');

class GigRepository extends CrudRepository {
    constructor() {
        super(Gig);
    }

    async getById(id) {
        try {
            const gig = await Gig.findById(id).exec();
            return gig;
        } catch (error) {
            throw error;
        }
    }

    async getGigs() {
        try {
            const gig = await Gig.find({});
            return gig;
        } catch (error) {
            throw error;
        }
    }

    async getGigById(id) {
        try {
            const gig = await Gig.findById(id).exec();
            return gig;
        } catch (error) {
            throw error;
        }
    }

    async deleteGig(id){
        try {
            const response = await Gig.findOneAndDelete({_id: id})
            return response;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = GigRepository;