import { NextRequest } from "next/server";

/**
 * POST /api/chat
 * Streams AI responses using Server-Sent Events (SSE).
 * Body: { messages: Array, model: string, context?: string }
 *
 * Uses OpenRouter API with automatic model fallback.
 * Returns: text/event-stream with chunks of assistant text.
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, model, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured. Set it in .env.local" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with project context
    const systemMessage = {
      role: "system",
      content: `You are OpenCode Agent, an AI coding assistant integrated into a VS Code-like IDE. You help developers write, debug, improve, and generate code. You have access to the user's project context and currently open files.

Key capabilities:
- Generate complete files, components, APIs, and pages
- Edit, refactor, and improve existing code
- Detect and fix bugs with explanations
- Convert code between languages
- Explain complex code
- Review code for best practices

When providing code, ALWAYS use markdown code blocks with the appropriate language identifier (e.g., \`\`\`typescript, \`\`\`python).
When generating multiple files, clearly label each file path before the code block.

${context ? `\nCurrent Project Context:\n${context}` : ""}`,
    };

    // Model fallback chain: preferred → qwen3 → gemma3
    const models = [
      model || "deepseek/deepseek-chat-v3-0324",
      "qwen/qwen3-235b-a22b",
      "google/gemma-3-27b-it",
    ];

    // Attempt streaming with each model in order
    for (const currentModel of models) {
      try {
        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://opencode-agent.local",
            "X-Title": "OpenCode Agent",
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [systemMessage, ...messages],
            max_tokens: 4096,
            temperature: 0.7,
            stream: true,
          }),
        });

        if (!apiResponse.ok) {
          const errorBody = await apiResponse.text();
          console.warn(`Model ${currentModel} failed (${apiResponse.status}):`, errorBody.slice(0, 200));
          continue; // Try next model
        }

        if (!apiResponse.body) {
          continue;
        }

        // Stream the response back as SSE
        const upstream = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Send model name first so client knows which model is responding
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "model", model: currentModel })}\n\n`)
              );

              let fullContent = "";

              while (true) {
                const { done, value } = await upstream.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

                for (const line of lines) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") {
                    // Send completion event with full content for persistence
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "done", content: fullContent, model: currentModel })}\n\n`
                      )
                    );
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                      fullContent += delta;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`
                        )
                      );
                    }
                  } catch {
                    // Skip unparseable lines
                  }
                }
              }

              // If we get here without [DONE], still send completion
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "done", content: fullContent, model: currentModel })}\n\n`
                )
              );
              controller.close();
            } catch (streamErr) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "error", content: "Stream interrupted" })}\n\n`
                )
              );
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (err) {
        console.warn(`Model ${currentModel} threw:`, (err as Error).message);
        continue;
      }
    }

    // All models failed
    return new Response(
      JSON.stringify({
        error: "All AI models are currently unavailable. Please try again later.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
