import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store";
import { setTheme, toggleTheme, type Theme } from "@/store/themeSlice";

/**
 * The theme, plus a DOM effect that stamps `<html data-theme>` (or clears it, so an unset theme follows
 * the system `prefers-color-scheme`). index.css keys its dark ramp off exactly this attribute.
 */
export function useTheme() {
  const theme = useAppSelector((s) => s.theme.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }, [theme]);

  return {
    theme,
    toggle: () => dispatch(toggleTheme()),
    set: (t: Theme) => dispatch(setTheme(t)),
  };
}
