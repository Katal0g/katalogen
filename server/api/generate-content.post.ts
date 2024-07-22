import { OpenAI } from "openai";
import { buildUserPrompt, SYSTEM_PROMPT } from "~/utils/prompt";
import { H3Event, createEventStream, appendResponseHeaders } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const userPrompt = body.customPrompt
      ? body.customPrompt
      : buildUserPrompt(body.level, body.subject, body.title, body.nbQuestions);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      stream: true,
    });

    const eventStream = createEventStream(event);
    appendResponseHeaders(event, {
      "cache-control": "no-cache",
      connection: "keep-alive",
      "content-type": "text/event-stream",
    });

    (async () => {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          eventStream.push(content).then();
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          eventStream.close().then();
          break;
        }
      }
    })().then((r) => r);

    eventStream.onClosed(async () => {
      await eventStream.close();
    });

    return eventStream.send();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating content",
    });
  }
});
