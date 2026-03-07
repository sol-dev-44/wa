import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  activeChildId: string | null;
  sidebarCollapsed: boolean;
}

const initialState: AppState = {
  activeChildId: null,
  sidebarCollapsed: true,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setActiveChildId(state, action: PayloadAction<string | null>) {
      state.activeChildId = action.payload;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setActiveChildId, setSidebarCollapsed, toggleSidebar } =
  appSlice.actions;

export default appSlice.reducer;
