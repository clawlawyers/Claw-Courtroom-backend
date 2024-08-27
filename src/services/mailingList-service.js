const { MailingListRespository } = require('../repositories')

const mailingListRespository = new MailingListRespository();

async function createSubscriber(email) {
    try {
        const subscriber = await mailingListRespository.create({ email });
        return subscriber
    } catch (error) {
        console.log(error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createSubscriber
}