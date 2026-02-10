import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  // chatId -> position -> selectedVersion
  selectedVersions: Record<string, Record<number, number>>;
}

const initialState: ChatState = {
  selectedVersions: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedVersion: (
      state,
      action: PayloadAction<{ chatId: string; position: number; version: number }>
    ) => {
      const { chatId, position, version } = action.payload;
      if (!state.selectedVersions[chatId]) {
        state.selectedVersions[chatId] = {};
      }
      state.selectedVersions[chatId][position] = version;
    },
    resetChatVersions: (state, action: PayloadAction<string>) => {
      delete state.selectedVersions[action.payload];
    },
    clearSelectedVersion: (
      state,
      action: PayloadAction<{ chatId: string; position: number }>
    ) => {
      const { chatId, position } = action.payload;
      if (state.selectedVersions[chatId]) {
        delete state.selectedVersions[chatId][position];
      }
    },
  },
});

export const { setSelectedVersion, resetChatVersions, clearSelectedVersion } = chatSlice.actions;
export default chatSlice.reducer;
