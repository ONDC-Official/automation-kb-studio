import { Moon, Sun } from "lucide-react";

import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";

/** Flips light/dark. From "follow system" (unset) the first press lands on explicit dark. */
const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

export default ThemeToggle;
