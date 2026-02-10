import { useMemo, useCallback } from "react";
import { Message } from "../types/chat";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedVersion } from "../store/features/chat/chatSlice";

export interface VersionInfo {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useMessageTree = (messages: Message[], chatId: string) => {
  const dispatch = useAppDispatch();
  const selectedVersions = useAppSelector((state: any) => state.chat.selectedVersions[chatId] || {});

  // 1. Group messages by position
  const messagesByPosition = useMemo(() => {
    const map = new Map<number, Message[]>();
    messages.forEach((msg) => {
      if (!map.has(msg.position)) {
        map.set(msg.position, []);
      }
      map.get(msg.position)?.push(msg);
    });

    // Sort versions within each position
    map.forEach((msgs) => {
      msgs.sort((a, b) => a.version - b.version);
    });

    return map;
  }, [messages]);

  // 2. Build the linear thread based on selections
  const thread = useMemo(() => {
    const result: Message[] = [];
    const positions = Array.from(messagesByPosition.keys()).sort((a, b) => a - b);

    positions.forEach((pos) => {
      const versions = messagesByPosition.get(pos) || [];
      if (versions.length === 0) return;

      const selectedV = selectedVersions[pos];
      let chosenMessage: Message | undefined;

      if (selectedV !== undefined) {
        chosenMessage = versions.find((m) => m.version === selectedV);
      }

      if (!chosenMessage) {
        // Default to the latest version
        chosenMessage = versions[versions.length - 1];
      }

      if (chosenMessage) {
        result.push(chosenMessage);
      }
    });

    return result;
  }, [messagesByPosition, selectedVersions]);

  // 3. Helpers
  const getVersionInfo = useCallback((message: Message): VersionInfo => {
    const versions = messagesByPosition.get(message.position) || [];
    const index = versions.findIndex((m) => m.version === message.version);
    
    return {
      current: index + 1,
      total: versions.length,
      hasPrev: index > 0,
      hasNext: index < versions.length - 1,
    };
  }, [messagesByPosition]);

  const selectVersion = useCallback((message: Message, direction: "next" | "prev") => {
    const versions = messagesByPosition.get(message.position) || [];
    const currentIndex = versions.findIndex((m) => m.version === message.version);

    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "prev") newIndex = Math.max(0, currentIndex - 1);
    if (direction === "next") newIndex = Math.min(versions.length - 1, currentIndex + 1);

    if (newIndex !== currentIndex) {
      const nextMessage = versions[newIndex];
      dispatch(setSelectedVersion({ 
        chatId, 
        position: message.position, 
        version: nextMessage.version 
      }));
    }
  }, [messagesByPosition, chatId, dispatch]);

  return {
    thread,
    getVersionInfo,
    selectVersion,
  };
};
