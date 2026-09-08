export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { question } = req.body || {};

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

        const response = await fetch(
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
                            parts: [
                                {
                                    text: `Answer this question accurately.

Question:
${cleanQuestion}

Instructions:
- Give the correct answer first.
- Keep the answer clear and concise.
- If necessary, provide a short explanation.
- Do not invent information.`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return res.status(response.status).json({
                error: "Gemini could not answer the question."
            });
        }

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            return res.status(500).json({
                error: "No answer was returned by Gemini."
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
}
