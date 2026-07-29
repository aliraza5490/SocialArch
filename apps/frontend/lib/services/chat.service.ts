import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/lib/utils/jwt";

export interface ChatItem {
  ID: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  size?: number;
  url?: string;
  path?: string;
}

export interface ChatMessage {
  ID?: string;
  chatId?: string;
  role: "user" | "assistant";
  content: string;
  position: number;
  version?: number;
  createdAt?: string;
  attachments?: ChatAttachment[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const chatService = {
  async getChats(): Promise<ChatItem[]> {
    const res = await apiClient.get("/chat");
    return res.data;
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get(`/chat/${chatId}/messages`);
    return res.data;
  },

  async renameChat(chatId: string, title: string): Promise<ChatItem> {
    const res = await apiClient.patch(`/chat/${chatId}`, { title });
    return res.data;
  },

  async deleteChat(chatId: string): Promise<void> {
    await apiClient.delete(`/chat/${chatId}`);
  },

  async sendMessageStream({
    chatId,
    content,
    newChat,
    position,
    attachments,
    onChunk,
    onChatIdCreated,
    onAttachment,
    signal,
  }: {
    chatId?: string;
    content: string;
    newChat?: boolean;
    position?: number;
    attachments?: ChatAttachment[];
    onChunk: (chunk: string) => void;
    onChatIdCreated?: (newChatId: string) => void;
    onAttachment?: (attachment: ChatAttachment) => void;
    signal?: AbortSignal;
  }): Promise<string> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        chatId,
        content,
        newChat,
        position,
        attachments,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    const processText = (text: string) => {
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const rawData = trimmed.replace(/^data:\s*/, "");
          if (rawData === "[DONE]") {
            continue;
          }
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.chatId && onChatIdCreated) {
              onChatIdCreated(parsed.chatId);
            }
            if (parsed.attachment && onAttachment) {
              onAttachment({
                id: parsed.attachment.ID || parsed.attachment.id,
                name: parsed.attachment.name,
                mimeType: parsed.attachment.mimeType,
                size: parsed.attachment.size,
                type: parsed.attachment.type,
                url: `/assets/${parsed.attachment.ID || parsed.attachment.id}/file`,
              });
            }
            if (parsed.content) {
              accumulatedText += parsed.content;
              onChunk(parsed.content);
            }
          } catch (err) {
            console.error("Error parsing SSE line:", err, rawData);
          }
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          processText("\n");
        }
        break;
      }
      processText(decoder.decode(value, { stream: true }));
    }

    return accumulatedText;
  },

  async regenerateMessageStream({
    chatId,
    position,
    onChunk,
    onAttachment,
    signal,
  }: {
    chatId: string;
    position: number;
    onChunk: (chunk: string) => void;
    onAttachment?: (attachment: ChatAttachment) => void;
    signal?: AbortSignal;
  }): Promise<string> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/chat/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        chatId,
        position,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    const processText = (text: string) => {
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const rawData = trimmed.replace(/^data:\s*/, "");
          if (rawData === "[DONE]") {
            continue;
          }
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.attachment && onAttachment) {
              onAttachment({
                id: parsed.attachment.ID || parsed.attachment.id,
                name: parsed.attachment.name,
                mimeType: parsed.attachment.mimeType,
                size: parsed.attachment.size,
                type: parsed.attachment.type,
                url: `/assets/${parsed.attachment.ID || parsed.attachment.id}/file`,
              });
            }
            if (parsed.content) {
              accumulatedText += parsed.content;
              onChunk(parsed.content);
            }
          } catch (err) {
            console.error("Error parsing SSE line:", err, rawData);
          }
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          processText("\n");
        }
        break;
      }
      processText(decoder.decode(value, { stream: true }));
    }

    return accumulatedText;
  },
};
