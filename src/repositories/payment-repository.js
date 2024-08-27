const { Payment } = require('../models')
const CrudRepository = require('./crud-repository');

class PaymentRepository extends CrudRepository {
    constructor() {
        super(Payment);
    }
}

module.exports = PaymentRepository;