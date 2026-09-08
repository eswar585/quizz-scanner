module.exports = async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const body = req.body || {};
        const question = body.question;

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

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing.");

            return res.status(500).json({
                error: "Gemini API key is not configured."
            });
        }

        const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text:
                                        "Answer the following question accurately.\n\n" +
                                        "Question:\n" +
                                        cleanQuestion +
                                        "\n\n" +
                                        "Instructions:\n" +
                                        "- Give the correct answer first.\n" +
                                        "- Keep the answer clear and concise.\n" +
                                        "- Give a short explanation when useful.\n" +
                                        "- Do not invent information."
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Gemini API error:", data);

            return res.status(502).json({
                error: "Gemini could not answer the question."
            });
        }

        const answer =
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text;

        if (!answer) {
            console.error("Unexpected Gemini response:", data);

            return res.status(502).json({
                error: "Gemini returned no answer."
            });
        }

        return res.status(200).json({
            answer: answer,
            source: "Gemini AI"
        });

    } catch (error) {
        console.error("Answer API error:", error);

        return res.status(500).json({
            error: "Unable to generate an answer."
        });
    }
};
