const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { create_client, create_thread, answer_request, conversation_history } = require('../scripts/legalGPT');
const { ErrorResponse } = require('../utils/common');


async function createClient(req, res) {
    try {
        const client_id = await create_client();
        return res.status(StatusCodes.OK).json({ client_id });
    }
    catch (error) {
        console.log("Failed to create client", error);
        return res.sendStatus(500);
    }
};

async function createThread(req, res) {
    try {
        const response = await create_thread();
        console.log("thread created", response);
        return res.status(StatusCodes.OK).json({ thread: response })
    } catch (error) {
        console.log("Failed to create thread", error);
        return res.sendStatus(500);
    }
};

async function generateResponse(req, res) {
    try {
        const { question, thread_id, assistant_id } = req.body;
        if (!question || !thread_id || !assistant_id) throw new AppError("Missing required parameters", StatusCodes.BAD_REQUEST);
        const gptResponse = await answer_request(question, thread_id, assistant_id);
        return res.status(StatusCodes.OK).json({ gptResponse });
    } catch (error) {
        console.log("Failed to generate response", error);
        return res.sendStatus(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
    }
};


async function conversationHistory(req, res) {
    try {
        const { thread_id } = req.body;
        if (!thread_id) throw new AppError("Missing required parameters", StatusCodes.BAD_REQUEST);
        const conversationHistory = await conversation_history(thread_id);
        return res.json({ conversationHistory: conversationHistory.reverse() });

    } catch (error) {
        console.log("Failed to generate history", error);
        res.sendStatus(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    generateResponse,
    conversationHistory,
    createClient,
    createThread
}