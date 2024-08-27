const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error');
const { PaymentRepository } = require('../repositories');


const paymentRepository = new PaymentRepository();

async function createPayment(data) {
    try {
        const payment = await paymentRepository.create(data);
        return payment;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
async function updatePayment(id, data) {
    try {
        const updatedPayment = await paymentRepository.update(id, data);
        return updatedPayment;
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}



module.exports = {
    createPayment,
    updatePayment,
}