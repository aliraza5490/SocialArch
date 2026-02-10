export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  position: number;
  version: number;
  chatId?: string;
  createdAt?: string;
}
