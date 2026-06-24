"use client";

import { create } from "zustand";
import { ChatMessage } from "@/types";
import { v4 as uuid } from "uuid";

const CHAT_HISTORY_KEY = "opencode-chat-history";
const SELECTED_MODEL_KEY = "opencode-selected-model";

/** Load persisted chat messages from localStorage */
function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/** Save chat messages to localStorage */
function saveChatHistory(messages: ChatMessage[]) {
  try {
    // Only keep last 100 messages to avoid localStorage limits
    const toSave = messages.slice(-100);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore quota errors
  }
}

/** Load persisted model selection */
function loadSelectedModel(): string {
  try {
    return localStorage.getItem(SELECTED_MODEL_KEY) || "deepseek/deepseek-chat-v3-0324";
  } catch {
    return "deepseek/deepseek-chat-v3-0324";
  }
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedModel: string;
  /** The message currently being streamed (appended to in real-time) */
  streamingMessageId: string | null;
  abortController: AbortController | null;

  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  clearMessages: () => void;
  setLoading: (v: boolean) => void;
  setSelectedModel: (m: string) => void;

  /** Send a message and stream the AI response via SSE */
  sendMessage: (content: string, context?: string) => Promise<void>;
  /** Abort the current streaming response */
  stopGeneration: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: loadChatHistory(),
  isLoading: false,
  selectedModel: loadSelectedModel(),
  streamingMessageId: null,
  abortController: null,

  addMessage: (msg) => {
    const newMsg = { ...msg, id: uuid(), timestamp: Date.now() };
    set((s) => {
      const updated = [...s.messages, newMsg];
      saveChatHistory(updated);
      return { messages: updated };
    });
  },

  setMessages: (msgs) => {
    set({ messages: msgs });
    saveChatHistory(msgs);
  },

  clearMessages: () => {
    set({ messages: [], streamingMessageId: null });
    saveChatHistory([]);
  },

  setLoading: (v) => set({ isLoading: v }),

  setSelectedModel: (m) => {
    set({ selectedModel: m });
    try {
      localStorage.setItem(SELECTED_MODEL_KEY, m);
    } catch {}
  },

  sendMessage: async (content, context) => {
    const state = get();
    if (state.isLoading) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Create a placeholder assistant message that will be filled via streaming
    const assistantMsgId = uuid();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    set((s) => {
      const updated = [...s.messages, userMsg, assistantMsg];
      saveChatHistory(updated);
      return {
        messages: updated,
        isLoading: true,
        streamingMessageId: assistantMsgId,
      };
    });

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...get().messages.slice(-21, -1)], // Exclude the empty placeholder
          model: get().selectedModel,
          context,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `Chat API error: ${res.status}`);
      }

      // Check if the response is streaming (SSE) or JSON error
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/event-stream")) {
        // Non-streaming error response
        const data = await res.json();
        throw new Error(data.error || "Unexpected response format");
      }

      // Read the SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let responseModel = get().selectedModel;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6).trim());

            if (data.type === "model") {
              responseModel = data.model;
            } else if (data.type === "chunk") {
              accumulatedContent += data.content;
              // Update the assistant message in real-time
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulatedContent }
                    : m
                ),
              }));
            } else if (data.type === "done") {
              accumulatedContent = data.content || accumulatedContent;
              responseModel = data.model || responseModel;
            } else if (data.type === "error") {
              throw new Error(data.content || "Stream error");
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Stream error") {
              // Ignore JSON parse errors for malformed SSE lines
            } else {
              throw parseErr;
            }
          }
        }
      }

      // Finalize the assistant message
      set((s) => {
        const updated = s.messages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: accumulatedContent || "No response received.",
                model: responseModel,
              }
            : m
        );
        saveChatHistory(updated);
        return {
          messages: updated,
          isLoading: false,
          streamingMessageId: null,
          abortController: null,
        };
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped generation - keep whatever was streamed so far
        set((s) => {
          const updated = s.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content || "Generation stopped by user." }
              : m
          );
          saveChatHistory(updated);
          return { messages: updated, isLoading: false, streamingMessageId: null, abortController: null };
        });
        return;
      }

      // Error occurred - update the placeholder message with error text
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      set((s) => {
        const updated = s.messages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `Sorry, an error occurred: ${errMsg}\n\nPlease check your OPENROUTER_API_KEY in .env.local and try again.`,
              }
            : m
        );
        saveChatHistory(updated);
        return { messages: updated, isLoading: false, streamingMessageId: null, abortController: null };
      });
    }
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
  },
}));
