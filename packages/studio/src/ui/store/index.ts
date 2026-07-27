import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import themeReducer from "./themeSlice";

/**
 * Redux is theme-only. There is no `authSlice`: this app has no login — the server identifies the
 * user ambiently (cookie/proxy) via `/api/whoami`, which is polled/refetched server state and so lives
 * in React Query, not here. Persisted so a forced light/dark choice survives a reload.
 */
const rootReducer = combineReducers({ theme: themeReducer });

const persistedReducer = persistReducer(
  { key: "kb-studio", storage, whitelist: ["theme"] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
