import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await apiClient.get("/chat");
      return response.data;
    },
  });
};

export const useChatMessages = (chatId: string) => {
  return useQuery({
    queryKey: ["chats", chatId, "messages"],
    queryFn: async () => {
      const response = await apiClient.get(`/chat/${chatId}/messages`);
      return response.data;
    },
    enabled: !!chatId,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const response = await apiClient.post("/chat", { title });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiClient.patch(`/chat/${id}`, { title });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/chat/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useRegenerateResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, parentMessageId }: { chatId: string; parentMessageId: string }) => {
      const response = await apiClient.post("/ai/regenerate", { chatId, parentMessageId });
      return response.data;
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["chats", chatId, "messages"] });
    },
  });
};
