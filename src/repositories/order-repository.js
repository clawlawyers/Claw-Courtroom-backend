const { Order } = require('../models')
const CrudRepository = require('./crud-repository');

class OrderRepository extends CrudRepository {
    constructor() {
        super(Order);
    }

    async getById(id) {
        try {
            const order = await Order.findById(id);
            return order;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderRepository;