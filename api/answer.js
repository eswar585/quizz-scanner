module.exports = async function handler(req, res) {
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

        const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
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
                                    text: `Answer this question accurately and clearly.

Question:
${cleanQuestion}

Instructions:
- Give the answer first.
- Keep the answer concise.
- Add a short explanation if useful.
- Do not invent information.`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await geminiResponse.json();

        // IMPORTANT:
        // Log the real Gemini error so we can diagnose it.
        if (!geminiResponse.ok) {
            console.error(
                "Gemini HTTP status:",
                geminiResponse.status
            );

            console.error(
                "Gemini response:",
                JSON.stringify(data)
            );

            return res.status(502).json({
                error: "Gemini API error.",
                geminiStatus: geminiResponse.status,
                details:
                    data?.error?.message ||
                    "Unknown Gemini error."
            });
        }

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            console.error(
                "Unexpected Gemini response:",
                JSON.stringify(data)
            );

            return res.status(502).json({
                error: "Gemini returned no answer."
            });
        }

        return res.status(200).json({
            answer,
            source: "Gemini AI"
        });

    } catch (error) {
        console.error(
            "Server error:",
            error
        );

        return res.status(500).json({
            error: "Unable to connect to Gemini."
        });
    }
};
