import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** null = follow the system (no explicit choice); otherwise the user's forced theme. */
export type Theme = "light" | "dark" | null;

export interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = { theme: null };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      // From "follow system" the first toggle lands on an explicit dark, then flips light/dark.
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
