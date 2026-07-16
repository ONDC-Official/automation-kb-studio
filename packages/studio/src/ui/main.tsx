/** Browser entry: mount <App/> into #root and pull in the (self-contained) stylesheet. */
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
