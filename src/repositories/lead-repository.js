const { Lead } = require('../models')
const CrudRepository = require('./crud-repository');

class LeadRepository extends CrudRepository {
    constructor() {
        super(Lead);
    }

    async getById(id) {
        try {
            const lead = await Lead.findById(id).exec();
            return lead;
        } catch (error) {
            throw error;
        }
    }

    async getLeads() {
        try {
            const leads = await Lead.find({});
            return leads;
        } catch (error) {
            throw error;
        }
    }

    async getLeadById(id) {
        try {
            const lead = await Lead.findById(id).exec();
            return lead;
        } catch (error) {
            throw error;
        }
    }

    async deleteLead(id){
        try {
            const response = await Gig.findOneAndDelete({_id: id})
            return response;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = LeadRepository;