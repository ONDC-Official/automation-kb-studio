# Code Templates

Starting points for each file type in the standard layout. Copy the shape, not necessarily the contents. If the project already has one of these files, match it instead of replacing it.

## Contents

1. [`lib/utils.ts` — cn()](#1-libutilsts)
2. [`services/httpClient.ts`](#2-serviceshttpclientts)
3. [`services/types.ts`](#3-servicestypests)
4. [Generic query hooks](#4-generic-query-hooks)
5. [Domain hook](#5-domain-hook)
6. [Page folder](#6-page-folder)
7. [CVA component](#7-cva-component)
8. [Form pattern](#8-form-pattern)
9. [Redux store](#9-redux-store)
10. [Routes + ProtectedLayout](#10-routes--protectedlayout)
11. [Layout NAV](#11-layout-nav)

---

## 1. `lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This is the only sanctioned way to compose classNames. `twMerge` is what makes `cn("p-2", props.className)` behave when the caller passes `p-4`.

---

## 2. `services/httpClient.ts`

```ts
import axios, { AxiosError } from "axios";

export interface ApiError {
  status: number;
  message: string;
  body?: unknown;
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ??
        error.message ??
        "Something went wrong",
      body: error.response?.data,
    };
    return Promise.reject(apiError);
  },
);

export default httpClient;
```

Every failure in the app becomes an `ApiError` here, so no call site has to unwrap axios shapes. Nothing outside `hooks/` imports this file.

---

## 3. `services/types.ts`

```ts
// API contracts. Each type notes the backend file it mirrors —
// when the contract changes, edit here first and let tsc find the call sites.

/** mirrors: internal/api/health.go — HealthResponse */
export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  uptimeSeconds: number;
  checks: Array<{ name: string; healthy: boolean; detail?: string }>;
}

/** mirrors: internal/redis/scan.go — ScanResult */
export interface ScanResult {
  keys: string[];
  cursor: string;
}
```

Domain types get no `I` prefix. Never redeclare a shape that already lives here.

---

## 4. Generic query hooks

`hooks/useGet.ts`:

```ts
import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type { ApiError } from "@/services/httpClient";

export function useGet<TData>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn: fetcher,
    ...options,
  });
}
```

`hooks/usePost.ts` (and `usePatch.ts`, identical but for the verb):

```ts
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type { ApiError } from "@/services/httpClient";

interface PostOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  /** keys to invalidate on success */
  invalidates?: QueryKey[];
}

export function usePost<TData, TVariables = void>(
  mutator: (variables: TVariables) => Promise<TData>,
  { invalidates, ...options }: PostOptions<TData, TVariables> = {},
) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: mutator,
    ...options,
    onSuccess: (data, variables, context) => {
      invalidates?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      options.onSuccess?.(data, variables, context);
    },
  });
}
```

`hooks/useInfiniteGet.ts`:

```ts
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import type { ApiError } from "@/services/httpClient";

export function useInfiniteGet<TPage, TCursor = string>(
  key: QueryKey,
  fetcher: (cursor: TCursor | undefined) => Promise<TPage>,
  getNextCursor: (lastPage: TPage) => TCursor | undefined,
  initialCursor?: TCursor,
) {
  return useInfiniteQuery<TPage, ApiError>({
    queryKey: key,
    queryFn: ({ pageParam }) => fetcher(pageParam as TCursor | undefined),
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => getNextCursor(lastPage as TPage),
  });
}
```

Call sites use these, never `useQuery`/`useMutation` directly — that's what keeps every hook in the app shaped the same.

---

## 5. Domain hook

`hooks/useHealth.ts` — one file per backend domain, exporting its key factory alongside its hooks:

```ts
import httpClient from "@/services/httpClient";
import type { HealthResponse } from "@/services/types";
import { useGet } from "./useGet";

export const healthKeys = {
  all: ["health"] as const,
  detail: (service: string) => ["health", service] as const,
};

export function useHealth() {
  return useGet<HealthResponse>(
    healthKeys.all,
    async () => (await httpClient.get<HealthResponse>("/health")).data,
    { refetchInterval: 10_000 },
  );
}

export function useServiceHealth(service: string) {
  return useGet<HealthResponse>(
    healthKeys.detail(service),
    async () =>
      (await httpClient.get<HealthResponse>(`/health/${service}`)).data,
    { enabled: Boolean(service) },
  );
}
```

Live data uses `refetchInterval` (health 10s, charts 30s). Query keys are never inlined as raw arrays at a call site — always through the factory, so invalidation stays greppable.

---

## 6. Page folder

`pages/logs/useLogsPage.ts` — everything stateful:

```ts
import { useMemo, useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { DEFAULT_STREAM, RANGES } from "./constants";
import { buildLogQL, parseLine } from "./utils";

export function useLogsPage() {
  const [stream, setStream] = useState(DEFAULT_STREAM);
  const [range, setRange] = useState(RANGES[0].value);
  const [search, setSearch] = useState("");

  const query = useMemo(
    () => buildLogQL({ stream, search }),
    [stream, search],
  );

  const { data, isLoading, isError, error, refetch } = useLogs(query, range);

  const rows = useMemo(() => (data?.lines ?? []).map(parseLine), [data]);

  return {
    stream, setStream,
    range, setRange,
    search, setSearch,
    rows, isLoading, isError, error,
    onRefresh: refetch,
  };
}
```

`pages/logs/index.tsx` — presentational only:

```tsx
import PageHeader from "@/components/PageHeader";
import { useLogsPage } from "./useLogsPage";
import FilterForm from "./FilterForm";
import LogsList from "./LogsList";
import LogsFooter from "./LogsFooter";

const Logs = () => {
  const { rows, isLoading, isError, error, onRefresh, ...filters } =
    useLogsPage();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Logs"
        description="Stream and filter application logs"
      />
      <FilterForm {...filters} onRefresh={onRefresh} />
      <LogsList rows={rows} isLoading={isLoading} isError={isError} error={error} />
      <LogsFooter count={rows.length} />
    </div>
  );
};

export default Logs;
```

`constants.ts` holds `DEFAULT_STREAM`/`RANGES`; `utils.ts` holds `buildLogQL`/`parseLine` as pure functions. If `index.tsx` grows a `useState`, it belongs in the page hook instead.

---

## 7. CVA component

`components/Button/variants.ts`:

```ts
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-4",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```

`components/Button/index.tsx`:

```tsx
import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./variants";

interface IProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({ className, variant, size, asChild, ...props }: IProps) => {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};

export default Button;
```

Variants live in `variants.ts`, never as ternaries in JSX. The `data-slot` attribute is what compound components hook into with `has-data-[slot=button]`. Nothing outside this folder imports `./variants`.

---

## 8. Form pattern

`hooks/useLogin.ts` — owns the form:

```ts
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import httpClient from "@/services/httpClient";
import type { ApiError } from "@/services/httpClient";
import { usePost } from "./usePost";

interface LoginForm {
  username: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const { mutateAsync } = usePost<{ token: string }, LoginForm>(
    async (values) =>
      (await httpClient.post<{ token: string }>("/auth/login", values)).data,
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      toast.success("Signed in");
      navigate("/");
    } catch (err) {
      setError("root", { message: (err as ApiError).message });
    }
  });

  return { register, onSubmit, errors, isSubmitting };
}
```

`pages/login/Form.tsx` — renders only:

```tsx
import FormInput from "@/components/FormInput";
import FormPasswordInput from "@/components/FormPasswordInput";
import Button from "@/components/Button";
import { useLogin } from "@/hooks/useLogin";

const Form = () => {
  const { register, onSubmit, errors, isSubmitting } = useLogin();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormInput
        label="Username"
        error={errors.username?.message}
        registration={register("username", {
          required: "Username is required",
        })}
      />
      <FormPasswordInput
        label="Password"
        error={errors.password?.message}
        registration={register("password", {
          required: "Password is required",
        })}
      />
      {errors.root?.message && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
};

export default Form;
```

`Form*` primitives take either a `registration` prop (RHF `register`) or `control`+`name` for controlled cases like a Radix Select. Inline `register` rules are fine; reach for a zod/yup resolver only when validation genuinely outgrows them.

---

## 9. Redux store

`store/authSlice.ts`:

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ username: string; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

`store/index.ts`:

```ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "./authSlice";
import themeReducer from "./themeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(
  { key: "root", storage, whitelist: ["auth", "theme"] },
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
```

These two slices are the entire legitimate scope of Redux. Anything from the server belongs in React Query; anything page-local belongs in the page hook.

---

## 10. Routes + ProtectedLayout

`components/Routes/index.tsx` — every route in one file:

```tsx
import { Navigate, Outlet, Route, Routes as RouterRoutes } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppSelector } from "@/store";
import Overview from "@/pages/overview";
import Logs from "@/pages/logs";
import Redis from "@/pages/redis";
import Login from "@/pages/login";

const ProtectedLayout = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const Routes = () => (
  <RouterRoutes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/" element={<Overview />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/redis" element={<Redis />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </RouterRoutes>
);

export default Routes;
```

New authenticated pages go inside the `ProtectedLayout` route. Never hand-roll a per-page auth check, and don't add a bespoke 404 unless product asks.

---

## 11. Layout NAV

`components/Layout/constants.ts`:

```ts
import { Activity, Database, ScrollText } from "lucide-react";

export const NAV = [
  { label: "Overview", to: "/", icon: Activity },
  { label: "Logs", to: "/logs", icon: ScrollText },
  { label: "Redis", to: "/redis", icon: Database },
] as const;
```

The sidebar maps over `NAV`. Adding a page to the sidebar means adding an entry here — not writing another `<NavLink>` by hand.
