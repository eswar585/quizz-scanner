export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { question } = req.body || {};

        // Validate question
        if (!question || typeof question !== "string") {
            return res.status(400).json({
                error: "Question is required."
            });
        }

        const cleanQuestion = question.trim();

        if (!cleanQuestion) {
            return res.status(400).json({
                error: "Question cannot be empty."
            });
        }

        // Make sure the API key exists on the server
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error("OPENAI_API_KEY is not configured.");

            return res.status(500).json({
                error: "Server API configuration is missing."
            });
        }

        // Call OpenAI Responses API
        const openAIResponse = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-5.5",
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text: `Answer the following question accurately.

Question:
${cleanQuestion}

Instructions:
- Give the correct answer first.
- Keep the answer clear and concise.
- If explanation is useful, provide a short explanation.
- Do not invent information.`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await openAIResponse.json();

        if (!openAIResponse.ok) {
            console.error("OpenAI API error:", data);

            return res.status(openAIResponse.status).json({
                error: "AI service could not answer the question."
            });
        }

        // Extract the generated text
        const answer = data.output_text;

        if (!answer) {
            return res.status(500).json({
                error: "No answer was returned."
            });
        }

        return res.status(200).json({
            answer: answer,
            source: "Internet / AI"
        });

    } catch (error) {
        console.error("Answer API error:", error);

        return res.status(500).json({
            error: "Unable to generate an answer."
        });
    }
}
