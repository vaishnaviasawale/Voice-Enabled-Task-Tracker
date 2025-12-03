const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

exports.extractTaskDetails = async (transcript) => {
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{
            role: "user",
            content:
                `Extract task details from this transcript: "${transcript}". 
Return JSON with {title, description, priority, status, dueDate (unix), rawTranscript}.`
        }]
    });

    return JSON.parse(response.choices[0].message.content);
};
