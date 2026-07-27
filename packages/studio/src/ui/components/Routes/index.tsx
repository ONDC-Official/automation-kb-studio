import { Navigate, Outlet, Route, Routes as RouterRoutes } from "react-router-dom";

import Layout from "@/components/Layout";
import Admin from "@/pages/admin";
import Author from "@/pages/author";
import Coverage from "@/pages/coverage";
import Evaluate from "@/pages/evaluate";

/**
 * All routes in one place. There is no `ProtectedLayout`: auth is ambient (the server identifies the
 * user), so every route is reachable — the Admin page self-gates on role. Hash routing (see main.tsx)
 * keeps the existing `#/coverage`-style links working against the zero-dep static server.
 */
const LayoutRoute = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const Routes = () => (
  <RouterRoutes>
    <Route element={<LayoutRoute />}>
      <Route path="/" element={<Author />} />
      <Route path="/coverage" element={<Coverage />} />
      <Route path="/evaluate" element={<Evaluate />} />
      <Route path="/admin" element={<Admin />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </RouterRoutes>
);

export default Routes;
