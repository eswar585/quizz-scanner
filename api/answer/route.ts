import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Answer this question accurately and clearly.

Question:
${question}

Give the correct answer first, followed by a short explanation.`,
            },
          ],
        },
      ],
    });

    return Response.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error("Answer API error:", error);

    return Response.json(
      { error: "Unable to generate an answer." },
      { status: 500 }
    );
  }
}
