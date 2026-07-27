import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

import Routes from "@/components/Routes";
import { persistor, store } from "@/store";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 5_000 },
  },
});

// HashRouter (not BrowserRouter): the app is served by a zero-dep static server with no SPA deep-link
// fallback, under a configurable subpath — hashes keep `#/coverage`-style links working with no server change.
const el = document.getElementById("root");
if (el)
  createRoot(el).render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <Tooltip.Provider delayDuration={300}>
              <HashRouter>
                <Routes />
                <Toaster richColors position="top-right" />
              </HashRouter>
            </Tooltip.Provider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </StrictMode>,
  );
