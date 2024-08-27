const OpenAI = require("openai");
const { OPEN_API_KEY } = require("../config/server-config");

const openai = new OpenAI({ apiKey: OPEN_API_KEY });

async function create_client() {
    const assistant = await openai.beta.assistants.create({
        name: "Lawyer",
        instructions: "Answer with respect to the Indian Constitution and Keep the response strictly under 100 words",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-3.5-turbo"
    })
    return assistant;
}

async function create_thread() {
    const thread = await openai.beta.threads.create();
    return thread;
}

async function delete_thread(thread_id) {
    const thread = await openai.beta.threads.delete(thread_id);
    return;
}

async function answer_request(question, thread_id, assistant_id) {
    const initial_content = "Answer with respect to the Indian Constitution and keep the response strictly under 100 words: ";
    const message = await openai.beta.threads.messages.create(thread_id, {
        role: "user",
        content: initial_content + question
    });
    const run = await openai.beta.threads.runs.create(thread_id, {
        assistant_id,
        instructions: "Answer with respect to the Indian Constitution and keep the response strictly under 100 words:"
    });

    let currRun = await openai.beta.threads.runs.retrieve(
        thread_id,
        run.id
    );

    while (currRun.status !== 'completed') {
        currRun = await openai.beta.threads.runs.retrieve(
            thread_id,
            run.id
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const messages = await openai.beta.threads.messages.list(thread_id);
    const response = messages.body.data
        .filter(({ run_id, role }) => (run_id === run.id && role === 'assistant'))
        .map(({ role, created_at, content, id }) => ({ role, created_at, id, text: content[0].text.value }));
    return response;
}
async function answer_request_stream(req, res) {
    try {
        const { question, thread_id, assistant_id } = req.body;
        const initial_content = "Answer with respect to the Indian Constitution and keep the response strictly under 100 words: ";
        const message = await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: initial_content + question
        });
        const run = await openai.beta.threads.runs.create(thread_id, {
            assistant_id,
            instructions: "Answer with respect to the Indian Constitution and keep the response strictly under 100 words:"
        });
        let prevRunStatus = "queued";
        let currRun = {};
        res.write(`\nevent:${prevRunStatus}\n`);
        while (currRun.status !== 'completed') {
            currRun = await openai.beta.threads.runs.retrieve(
                thread_id,
                run.id
            );
            if (prevRunStatus !== currRun.status) {
                prevRunStatus = currRun.status;
                res.write(`\nevent:${prevRunStatus}\n`);
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const messages = await openai.beta.threads.messages.list(thread_id);
        const response = messages.body.data
            .filter(({ run_id, role }) => (run_id === run.id && role === 'assistant'))
            .map(({ role, created_at, content, id }) => ({ role, created_at, id, text: content[0].text.value }));
        res.write(`data:${JSON.stringify(response[0])}\n\n`);

    } catch (error) {
        console.log(error);
    }
    return res.end();
}

async function conversation_history(thread_id) {
    const messages = await openai.beta.threads.messages.list(thread_id);
    const response = messages.body.data.map(({ id, created_at, role, content }) => ({ id, created_at, role, text: content[0].text.value }));
    return response;
}

module.exports = {
    create_client,
    create_thread,
    answer_request,
    conversation_history,
}
